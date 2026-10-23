#!/usr/bin/env bash
# Localhost health checks for Takiia only (read-only).
set -euo pipefail

API_URL="${TAKIIA_API_HEALTH_URL:-http://127.0.0.1:3033/health}"
WEB_URL="${TAKIIA_WEB_HEALTH_URL:-http://127.0.0.1:3034/api/health}"
HEALTH_RETRIES="${TAKIIA_HEALTH_RETRIES:-24}"
HEALTH_RETRY_SLEEP_SEC="${TAKIIA_HEALTH_RETRY_SLEEP_SEC:-2}"

validate_takiia_health_url() {
  local url="$1"
  local label="$2"

  if [[ ! "${url}" =~ ^https?://127\.0\.0\.1:[0-9]+/ ]]; then
    echo "::error::${label} URL must target 127.0.0.1 (got unsupported host)"
    exit 1
  fi

  local port
  port="$(echo "${url}" | sed -E 's#^https?://127\.0\.0\.1:([0-9]+)/.*#\1#')"
  if [[ "${label}" == "API" && "${port}" != "3033" ]]; then
    echo "::error::API health port must be 3033"
    exit 1
  fi
  if [[ "${label}" == "Web" && "${port}" != "3034" ]]; then
    echo "::error::Web health port must be 3034"
    exit 1
  fi
}

curl_health_ok() {
  local url="$1"
  local body
  if ! body="$(curl -fsS --connect-timeout 3 --max-time 10 "${url}" 2>/dev/null)"; then
    return 1
  fi
  echo "${body}" | grep -q '"status"[[:space:]]*:[[:space:]]*"ok"'
}

wait_for_health() {
  local url="$1"
  local label="$2"
  local attempt=1
  while [[ "${attempt}" -le "${HEALTH_RETRIES}" ]]; do
    if curl_health_ok "${url}"; then
      echo "${label} health OK (attempt ${attempt})"
      return 0
    fi
    echo "${label} not ready yet (attempt ${attempt}/${HEALTH_RETRIES})..."
    sleep "${HEALTH_RETRY_SLEEP_SEC}"
    attempt=$((attempt + 1))
  done
  echo "::error::${label} health check failed after ${HEALTH_RETRIES} attempts"
  return 1
}

validate_takiia_health_url "${API_URL}" "API"
validate_takiia_health_url "${WEB_URL}" "Web"

echo "Checking API health endpoint..."
wait_for_health "${API_URL}" "API"

echo "Checking Web health endpoint..."
wait_for_health "${WEB_URL}" "Web"

echo "Takiia health checks OK"
