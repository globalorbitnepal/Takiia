#!/usr/bin/env bash
# Prisma migration helpers — no schema changes from this script.
set -euo pipefail

takiia_has_prisma_migrations() {
  local app_root="$1"
  local migrations_dir="${app_root}/apps/api/prisma/migrations"
  local entry

  if [[ ! -d "${migrations_dir}" ]]; then
    return 1
  fi

  shopt -s nullglob
  for entry in "${migrations_dir}"/*/; do
    if [[ -f "${entry}migration.sql" ]]; then
      shopt -u nullglob
      return 0
    fi
  done
  shopt -u nullglob
  return 1
}

# Returns 0 if migrate status indicates pending migrations, 1 if up to date, 2 on unexpected error.
takiia_prisma_migrate_pending() {
  local app_root="$1"
  local status_output
  local status_code

  if ! takiia_has_prisma_migrations "${app_root}"; then
    return 1
  fi

  set +e
  status_output="$(cd "${app_root}/apps/api" && npx prisma migrate status 2>&1)"
  status_code=$?
  set -e

  if [[ "${status_code}" -eq 0 ]]; then
    if echo "${status_output}" | grep -qi 'database schema is up to date'; then
      return 1
    fi
    echo "::warning::Unexpected prisma migrate status success output; treating as no pending migrations."
    return 1
  fi

  if echo "${status_output}" | grep -qiE 'not yet been applied|following migration|drift'; then
    return 0
  fi

  echo "::error::prisma migrate status failed (database unreachable or misconfigured). Deployment stopped before PM2 reload."
  return 2
}
