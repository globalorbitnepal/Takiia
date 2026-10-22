#!/usr/bin/env bash
# Validate a PostgreSQL backup file before migrations (format + restorable TOC, not size alone).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=database.sh
source "${SCRIPT_DIR}/database.sh"

takiia_validate_db_backup_file() {
  local path="$1"

  if [[ -z "${path}" ]] || [[ ! -f "${path}" ]] || [[ ! -r "${path}" ]] || [[ ! -s "${path}" ]]; then
    echo "::error::Backup file must exist, be readable, and non-empty."
    return 1
  fi

  if ! node "${SCRIPT_DIR}/validate-db-backup-cli.mjs" validate-file "${path}"; then
    return 1
  fi

  return 0
}

# Migration gate: restorable backup, or empty custom catalog when DB is verified empty and operator confirmed baseline.
takiia_validate_db_backup_for_migrate_gate() {
  local path="$1"
  local database_url="${2:-}"

  if takiia_validate_db_backup_file "${path}"; then
    echo "Backup validated for migrations gate."
    return 0
  fi

  if [[ "${TAKIIA_CONFIRM_EMPTY_DATABASE_BASELINE:-}" != "yes" ]]; then
    echo "::error::Backup failed validation (must be pg_dump custom or plain SQL with restorable schema/table TOC, or set TAKIIA_CONFIRM_EMPTY_DATABASE_BASELINE=yes for verified empty takiia_db with a pre-migrate empty-catalog dump)."
    return 1
  fi

  if [[ -z "${database_url}" ]]; then
    echo "::error::DATABASE_URL is required for empty-database baseline backup validation."
    return 1
  fi

  if ! takiia_database_is_empty_baseline_eligible "${database_url}"; then
    echo "::error::Empty-database baseline backup is only allowed when takiia_db has no public tables and no _prisma_migrations."
    return 1
  fi

  if ! TAKIIA_ALLOW_EMPTY_CUSTOM_BASELINE=1 node "${SCRIPT_DIR}/validate-db-backup-cli.mjs" validate-file "${path}"; then
    echo "::error::Backup is not a valid empty-catalog pg_dump custom archive for first-migrate baseline."
    return 1
  fi

  echo "::warning::Accepted empty-catalog baseline backup — documents pre-migrate empty takiia_db only; not application-data recovery."
  echo "Backup validated for migrations gate (empty-database baseline)."
  return 0
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  if [[ $# -ne 1 ]]; then
    echo "usage: $0 <backup-file>" >&2
    exit 2
  fi
  takiia_validate_db_backup_file "$1"
fi
