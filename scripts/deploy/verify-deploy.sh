#!/usr/bin/env bash
# Post-deploy verification — fails if the server is not on the expected commit or still serving a stale web build.
set -euo pipefail

# Legacy starter HTML/RSC signatures (old production build before marketing site).
takiia_homepage_is_legacy_starter() {
  local body="$1"
  if echo "${body}" | grep -q 'Starter web app for messaging and calling'; then
    return 0
  fi
  if echo "${body}" | grep -q 'aria-label="Local development"'; then
    return 0
  fi
  if echo "${body}" | grep -q 'http://localhost:4000'; then
    return 0
  fi
  if echo "${body}" | grep -q 'Messaging and voice/video calling'; then
    return 0
  fi
  return 1
}

APP_ROOT="${TAKIIA_APP_ROOT:-/srv/apps/takiia}"
EXPECTED_SHA="${TAKIIA_EXPECTED_SHA:-${TAKIIA_DEPLOY_SHA:-}}"
WEB_ORIGIN="${TAKIIA_WEB_VERIFY_ORIGIN:-http://127.0.0.1:3034}"
API_ORIGIN="${TAKIIA_API_VERIFY_ORIGIN:-http://127.0.0.1:3033}"

if [[ -z "${EXPECTED_SHA}" ]]; then
  echo "::error::TAKIIA_EXPECTED_SHA or TAKIIA_DEPLOY_SHA is required for deploy verification"
  exit 1
fi

if [[ ! "${EXPECTED_SHA}" =~ ^[0-9a-f]{40}$ ]]; then
  echo "::error::Expected deploy SHA must be a 40-character commit hash"
  exit 1
fi

cd "${APP_ROOT}"

actual_sha="$(git rev-parse HEAD)"
if [[ "${actual_sha}" != "${EXPECTED_SHA}" ]]; then
  echo "::error::Git HEAD (${actual_sha}) does not match expected deploy SHA (${EXPECTED_SHA})"
  exit 1
fi

if [[ -f "${APP_ROOT}/.deploy-metadata.json" ]]; then
  if ! grep -q "\"commit\"[[:space:]]*:[[:space:]]*\"${EXPECTED_SHA}\"" "${APP_ROOT}/.deploy-metadata.json"; then
    echo "::error::.deploy-metadata.json commit does not match expected SHA"
    exit 1
  fi
else
  echo "::warning::.deploy-metadata.json missing; relying on git HEAD only"
fi

echo "Checking API health includes deploy commit..."
api_body="$(curl -fsS "${API_ORIGIN}/health")"
if ! echo "${api_body}" | grep -q '"status"[[:space:]]*:[[:space:]]*"ok"'; then
  echo "::error::API health response invalid"
  exit 1
fi
if ! echo "${api_body}" | grep -q "\"commit\"[[:space:]]*:[[:space:]]*\"${EXPECTED_SHA}\""; then
  echo "::error::API health does not report expected commit (still on old build?)"
  exit 1
fi

echo "Checking Web health includes deploy commit..."
web_body="$(curl -fsS "${WEB_ORIGIN}/api/health")"
if ! echo "${web_body}" | grep -q "\"commit\"[[:space:]]*:[[:space:]]*\"${EXPECTED_SHA}\""; then
  echo "::error::Web health does not report expected commit (PM2 may still be serving an old Next.js build)"
  exit 1
fi

echo "Checking marketing routes respond (current app, not legacy starter-only build)..."
pricing_code="$(curl -sS -o /dev/null -w '%{http_code}' "${WEB_ORIGIN}/pricing")"
if [[ "${pricing_code}" != "200" ]]; then
  echo "::error::GET /pricing returned ${pricing_code}; expected 200 for current marketing site"
  exit 1
fi

home_body="$(curl -fsS "${WEB_ORIGIN}/")"
if takiia_homepage_is_legacy_starter "${home_body}"; then
  echo "::error::Homepage matches legacy starter build markers; deploy did not update the running web build"
  exit 1
fi

if ! echo "${home_body}" | grep -q '_next/static'; then
  echo "::error::Homepage missing Next.js static assets path (_next/static)"
  exit 1
fi

echo "Deploy verification OK for commit ${EXPECTED_SHA}"
