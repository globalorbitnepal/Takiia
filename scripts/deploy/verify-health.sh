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

echo "Checking API health endpoint..."
api_body="$(curl -fsS "${API_URL}")"
if ! echo "${api_body}" | grep -q '"status"[[:space:]]*:[[:space:]]*"ok"'; then
  echo "::error::API health check failed"
  exit 1
fi

echo "Checking Web health endpoint..."
web_body="$(curl -fsS "${WEB_URL}")"
if ! echo "${web_body}" | grep -q '"status"[[:space:]]*:[[:space:]]*"ok"'; then
  echo "::error::Web health check failed"
  exit 1
fi

echo "Takiia health checks OK"
