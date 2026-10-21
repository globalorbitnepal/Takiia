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
