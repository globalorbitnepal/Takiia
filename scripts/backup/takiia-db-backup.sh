#!/usr/bin/env bash
# Timestamped pg_dump for takiia_db only. Does not delete existing backups.
set -euo pipefail

BACKUP_ROOT="${TAKIIA_BACKUP_ROOT:-/var/backups/takiia}"
APP_ROOT="${TAKIIA_APP_ROOT:-/srv/apps/takiia}"
ENV_FILE="${TAKIIA_API_ENV_FILE:-${APP_ROOT}/apps/api/.env}"
DRY_RUN="${TAKIIA_BACKUP_DRY_RUN:-0}"
MIN_TABLE_DATA="${TAKIIA_BACKUP_MIN_TABLE_DATA:-1}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../deploy/lib/database.sh
source "${SCRIPT_DIR}/../deploy/lib/database.sh"

usage() {
  echo "usage: $0 [--dry-run]" >&2
  echo "Creates /var/backups/takiia/takiia_db_backup_YYYYMMDD_HHMMSS.dump (+ .sha256)" >&2
  exit 2
}

if [[ "${1:-}" == "--help" ]] || [[ "${1:-}" == "-h" ]]; then
  usage
fi
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=1
fi

if [[ "$(whoami)" != "takiia" ]]; then
  echo "::error::takiia-db-backup.sh must run as user takiia" >&2
  exit 1
fi

if [[ ! -d "${BACKUP_ROOT}" ]]; then
  echo "::error::Backup root ${BACKUP_ROOT} does not exist" >&2
  exit 1
fi

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "::error::Missing ${ENV_FILE}" >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "${ENV_FILE}"
set +a

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "::error::DATABASE_URL is not set in ${ENV_FILE}" >&2
  exit 1
fi

if ! validate_takiia_database_url "${DATABASE_URL}"; then
  echo "::error::Backup refused: DATABASE_URL must target database takiia_db only" >&2
  exit 1
fi

TS="$(date +%Y%m%d_%H%M%S)"
OUT="${BACKUP_ROOT}/takiia_db_backup_${TS}.dump"
SHA="${OUT}.sha256"
LOG="${BACKUP_ROOT}/backup.log"

if [[ -e "${OUT}" ]]; then
  echo "::error::Refusing to overwrite existing file ${OUT}" >&2
  exit 1
fi

if [[ "${DRY_RUN}" == "1" ]]; then
  echo "dry-run: would pg_dump -Fc to ${OUT}"
  echo "dry-run: would validate pg_restore --list and TABLE DATA >= ${MIN_TABLE_DATA}"
  echo "dry-run: would write ${SHA} and chmod 600"
  exit 0
fi

START_TS="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
if ! pg_dump "${DATABASE_URL}" -Fc -f "${OUT}"; then
  echo "::error::pg_dump failed" >&2
  rm -f "${OUT}"
  exit 1
fi

BYTES="$(wc -c < "${OUT}" | tr -d ' ')"
if [[ "${BYTES}" -lt 1 ]]; then
  echo "::error::Backup file is empty" >&2
  exit 1
fi

LIST_OUT="$(mktemp)"
if ! pg_restore --list "${OUT}" > "${LIST_OUT}"; then
  rm -f "${LIST_OUT}"
  echo "::error::pg_restore --list failed" >&2
  exit 1
fi

TABLE_DATA_COUNT="$(grep -c 'TABLE DATA' "${LIST_OUT}" || true)"
rm -f "${LIST_OUT}"

if [[ "${TABLE_DATA_COUNT}" -lt "${MIN_TABLE_DATA}" ]]; then
  echo "::error::Backup has insufficient TABLE DATA entries (${TABLE_DATA_COUNT}); not deleting ${OUT}" >&2
  exit 1
fi

sha256sum "${OUT}" | tee "${SHA}"
chmod 600 "${OUT}" "${SHA}"

END_TS="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
printf '%s backup ok bytes=%s table_data=%s file=%s start=%s end=%s\n' \
  "${END_TS}" "${BYTES}" "${TABLE_DATA_COUNT}" "${OUT}" "${START_TS}" "${END_TS}" >> "${LOG}"
chmod 600 "${LOG}" 2>/dev/null || true

echo "Backup OK: ${OUT} (${BYTES} bytes, ${TABLE_DATA_COUNT} TABLE DATA entries)"
