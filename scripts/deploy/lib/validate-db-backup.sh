#!/usr/bin/env bash
# Validate a PostgreSQL backup file before migrations (format + restorable TOC, not size alone).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

takiia_validate_db_backup_file() {
  local path="$1"

  if [[ -z "${path}" ]] || [[ ! -f "${path}" ]] || [[ ! -r "${path}" ]] || [[ ! -s "${path}" ]]; then
    echo "::error::Backup file must exist, be readable, and non-empty."
    return 1
  fi

  if ! node "${SCRIPT_DIR}/validate-db-backup-cli.mjs" validate-file "${path}"; then
    echo "::error::Backup failed validation (must be pg_dump custom or plain SQL with restorable schema/table TOC)."
    return 1
  fi

  echo "Backup validated for migrations gate."
  return 0
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  if [[ $# -ne 1 ]]; then
    echo "usage: $0 <backup-file>" >&2
    exit 2
  fi
  takiia_validate_db_backup_file "$1"
fi
