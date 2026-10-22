#!/usr/bin/env bash
# Database URL validation without logging secrets.
set -euo pipefail

# Accept only URLs whose database name is exactly takiia_db (path segment).
validate_takiia_database_url() {
  local url="$1"
  if [[ -z "${url}" ]]; then
    return 1
  fi
  if [[ "${url}" =~ /takiia_db(\?|$) ]]; then
    return 0
  fi
  return 1
}

# Read-only: true when takiia_db has no public tables and no Prisma migration history.
takiia_database_is_empty_baseline_eligible() {
  local url="$1"
  local table_count
  local has_migrations

  if ! validate_takiia_database_url "${url}"; then
    echo "::error::Empty-database baseline check requires DATABASE_URL for takiia_db only."
    return 1
  fi

  table_count="$(psql "${url}" -v ON_ERROR_STOP=1 -Atc "SELECT count(*)::text FROM pg_catalog.pg_tables WHERE schemaname = 'public';")"
  has_migrations="$(psql "${url}" -v ON_ERROR_STOP=1 -Atc "SELECT CASE WHEN to_regclass('public._prisma_migrations') IS NULL THEN 'f' ELSE 't' END;")"

  if [[ "${table_count}" == "0" ]] && [[ "${has_migrations}" == "f" ]]; then
    return 0
  fi
  return 1
}
