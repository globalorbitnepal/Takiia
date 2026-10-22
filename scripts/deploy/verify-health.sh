#!/usr/bin/env bash
# Localhost health checks for Takiia only (read-only).
set -euo pipefail

API_URL="${TAKIIA_API_HEALTH_URL:-http://127.0.0.1:3033/health}"
WEB_URL="${TAKIIA_WEB_HEALTH_URL:-http://127.0.0.1:3034/api/health}"

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

validate_takiia_health_url "${API_URL}" "API"
validate_takiia_health_url "${WEB_URL}" "Web"

curl_health_ok() {
  local url="$1"
  local body
  body="$(curl -fsS "${url}" 2>/dev/null)" || return 1
  echo "${body}" | grep -q '"status"[[:space:]]*:[[:space:]]*"ok"'
}

wait_for_health() {
  local url="$1"
  local label="$2"
  local attempt
  for attempt in $(seq 1 30); do
    if curl_health_ok "${url}"; then
      return 0
    fi
    sleep 1
  done
  echo "::error::${label} health check failed after 30s"
  return 1
}

echo "Checking API health endpoint..."
wait_for_health "${API_URL}" "API"

echo "Checking Web health endpoint..."
wait_for_health "${WEB_URL}" "Web"

echo "Takiia health checks OK"
