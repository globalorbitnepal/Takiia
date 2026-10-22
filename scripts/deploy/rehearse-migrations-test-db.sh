#!/usr/bin/env bash
# Rehearse prisma migrate deploy on a non-production database (e.g. takiia_restore_test).
# Does not touch takiia_db, PM2, or /srv/apps/takiia working tree (uses git archive only).
set -euo pipefail

APP_ROOT="${TAKIIA_APP_ROOT:-/srv/apps/takiia}"
DEPLOY_SHA="${TAKIIA_DEPLOY_SHA:-}"
TEST_DB_NAME="${TAKIIA_TEST_DATABASE_NAME:-takiia_restore_test}"
REHEARSAL_ROOT="${TAKIIA_REHEARSAL_ROOT:-${HOME}/takiia-migrate-rehearsal}"

if [[ "$(whoami)" != "takiia" ]]; then
  echo "::error::rehearse-migrations-test-db.sh must run as user takiia"
  exit 1
fi

if [[ -z "${DEPLOY_SHA}" ]] || [[ ! "${DEPLOY_SHA}" =~ ^[0-9a-f]{40}$ ]]; then
  echo "::error::TAKIIA_DEPLOY_SHA (40-char commit) is required"
  exit 1
fi

cd "${APP_ROOT}"
git fetch origin main
if ! git cat-file -e "${DEPLOY_SHA}^{commit}" 2>/dev/null; then
  echo "::error::Commit ${DEPLOY_SHA} not available after fetch"
  exit 1
fi

rm -rf "${REHEARSAL_ROOT}"
mkdir -p "${REHEARSAL_ROOT}"
git archive "${DEPLOY_SHA}" apps/api | tar -x -C "${REHEARSAL_ROOT}"

ENV_FILE="${APP_ROOT}/apps/api/.env"
if [[ ! -f "${ENV_FILE}" ]]; then
  echo "::error::Missing ${ENV_FILE}"
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "${ENV_FILE}"
set +a

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "::error::DATABASE_URL not set in apps/api/.env"
  exit 1
fi

TEST_URL="$(node -e "
const u = new URL(process.env.DATABASE_URL);
u.pathname = '/${TEST_DB_NAME}';
console.log(u.toString());
")"

echo "Rehearsal target database: ${TEST_DB_NAME}"
table_count="$(psql "${TEST_URL}" -v ON_ERROR_STOP=1 -Atc "SELECT count(*)::text FROM pg_catalog.pg_tables WHERE schemaname = 'public';")"
echo "Public tables before migrate: ${table_count}"

PRISMA_BIN="${APP_ROOT}/node_modules/.bin/prisma"
if [[ ! -x "${PRISMA_BIN}" ]]; then
  echo "::error::Prisma CLI not found at ${PRISMA_BIN} (run npm ci in app root first)"
  exit 1
fi

cd "${REHEARSAL_ROOT}/apps/api"
DATABASE_URL="${TEST_URL}" "${PRISMA_BIN}" migrate deploy

after_tables="$(psql "${TEST_URL}" -v ON_ERROR_STOP=1 -Atc "SELECT count(*)::text FROM pg_catalog.pg_tables WHERE schemaname = 'public';")"
migration_rows="$(psql "${TEST_URL}" -v ON_ERROR_STOP=1 -Atc "SELECT count(*)::text FROM public._prisma_migrations;")"
plan_rows="$(psql "${TEST_URL}" -v ON_ERROR_STOP=1 -Atc "SELECT count(*)::text FROM public.\"Plan\";")"

echo "Public tables after migrate: ${after_tables}"
echo "_prisma_migrations rows: ${migration_rows}"
echo "Plan seed rows: ${plan_rows}"
echo "Rehearsal complete (non-production DB only)."
