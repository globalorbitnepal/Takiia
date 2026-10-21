#!/usr/bin/env bash
# Start or reload only Takiia PM2 apps (takiia-api, takiia-web).
set -euo pipefail

TAKIIA_PM2_API_NAME="takiia-api"
TAKIIA_PM2_WEB_NAME="takiia-web"

pm2_takiia_process_exists() {
  local name="$1"
  pm2 describe "${name}" >/dev/null 2>&1
}

# Start a single app from the Takiia ecosystem file, or reload if already registered.
pm2_takiia_start_or_reload() {
  local name="$1"
  local ecosystem_file="$2"

  if pm2_takiia_process_exists "${name}"; then
    pm2 reload "${name}" --update-env
    return 0
  fi

  # Starts only the named app from this ecosystem file (not other PM2 processes on the host).
  pm2 start "${ecosystem_file}" --only "${name}" --env production
}

pm2_takiia_start_or_reload_both() {
  local ecosystem_file="$1"
  pm2_takiia_start_or_reload "${TAKIIA_PM2_API_NAME}" "${ecosystem_file}"
  pm2_takiia_start_or_reload "${TAKIIA_PM2_WEB_NAME}" "${ecosystem_file}"
}
