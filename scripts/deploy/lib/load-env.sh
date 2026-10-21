#!/usr/bin/env bash
# Load an env file without printing secret values.
set -euo pipefail

load_env_file() {
  local env_file="$1"
  shift
  local -a required_vars=("$@")

  if [[ ! -f "${env_file}" ]]; then
    echo "::error::Missing env file: ${env_file}"
    return 1
  fi

  local mode
  local strict_perms="${LOAD_ENV_STRICT_PERMS:-0}"
  if mode=$(stat -c '%a' "${env_file}" 2>/dev/null); then
    if [[ "${mode}" != "600" && "${mode}" != "400" ]]; then
      if [[ "${strict_perms}" == "1" ]] || [[ "${env_file}" == *"/apps/api/.env" ]]; then
        echo "::error::Insecure permissions on ${env_file} (expected 600 or 400)."
        return 1
      fi
      echo "::warning::${env_file} should be chmod 600 or 400 (found ${mode})"
    fi
  fi

  set -a
  # shellcheck disable=SC1090
  source "${env_file}"
  set +a

  local name
  for name in "${required_vars[@]}"; do
    if [[ -z "${!name:-}" ]]; then
      echo "::error::Required variable is not set in ${env_file}: ${name}"
      return 1
    fi
  done

  return 0
}
