#!/usr/bin/env bash
# Restore-test helper — requires explicit non-production DATABASE_URL. Never targets takiia_db.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../deploy/lib/database.sh
source "${SCRIPT_DIR}/../deploy/lib/database.sh"

usage() {
  echo "usage: TAKIIA_RESTORE_TEST_DATABASE_URL=postgresql://.../takiia_dr_test_... $0 <dump-file>" >&2
  exit 2
}

DUMP="${1:-}"
TEST_URL="${TAKIIA_RESTORE_TEST_DATABASE_URL:-}"

if [[ -z "${DUMP}" ]] || [[ ! -f "${DUMP}" ]]; then
  usage
fi
if [[ -z "${TEST_URL}" ]]; then
  echo "::error::Set TAKIIA_RESTORE_TEST_DATABASE_URL to an isolated test database" >&2
  exit 1
fi
if validate_takiia_database_url "${TEST_URL}"; then
  echo "::error::Refusing restore test against production database name takiia_db" >&2
  exit 1
fi
if [[ "${TEST_URL}" =~ /takiia_db(\?|$) ]]; then
  echo "::error::Refusing restore test against takiia_db" >&2
  exit 1
fi

echo "Restore test target: (non-production database name verified)"
echo "Dump file: ${DUMP}"
echo "::warning::This script does not run pg_restore unless TAKIIA_RESTORE_TEST_EXECUTE=1"

if [[ "${TAKIIA_RESTORE_TEST_EXECUTE:-}" != "1" ]]; then
  echo "Dry plan: pg_restore --no-owner --no-acl -d <test> ${DUMP}"
  exit 0
fi

pg_restore --no-owner --no-acl -d "${TEST_URL}" "${DUMP}"
psql "${TEST_URL}" -v ON_ERROR_STOP=1 -Atc "SELECT count(*) FROM public._prisma_migrations;"
psql "${TEST_URL}" -v ON_ERROR_STOP=1 -Atc 'SELECT count(*) FROM public."Plan";'
