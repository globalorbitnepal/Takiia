#!/usr/bin/env bash
# Sync repository to approved ref (main by default for GitHub Actions deploys).
set -euo pipefail

APP_ROOT="${TAKIIA_APP_ROOT:-/srv/apps/takiia}"
DEPLOY_REF="${TAKIIA_DEPLOY_REF:-main}"
ENFORCE_MAIN_ONLY="${TAKIIA_ENFORCE_MAIN_ONLY:-0}"

cd "${APP_ROOT}"

if [[ "${ENFORCE_MAIN_ONLY}" == "1" ]] && [[ "${DEPLOY_REF}" != "main" ]]; then
  echo "::error::GitHub Actions deploy may only sync main (TAKIIA_ENFORCE_MAIN_ONLY=1)."
  exit 1
fi

if [[ "${ENFORCE_MAIN_ONLY}" == "1" ]] && [[ -z "${TAKIIA_DEPLOY_SHA:-}" ]]; then
  echo "::error::TAKIIA_DEPLOY_SHA is required when TAKIIA_ENFORCE_MAIN_ONLY=1 (CI-verified commit)."
  exit 1
fi

if [[ "${DEPLOY_REF}" == "main" ]]; then
  :
elif [[ "${DEPLOY_REF}" =~ ^[0-9a-f]{40}$ ]]; then
  if [[ "${ENFORCE_MAIN_ONLY}" == "1" ]]; then
    echo "::error::Commit SHA deploy is disabled for automated GitHub Actions deploys."
    exit 1
  fi
else
  echo "::error::TAKIIA_DEPLOY_REF must be 'main' or a 40-character commit SHA"
  exit 1
fi

if pm2 describe takiia-api >/dev/null 2>&1; then
  git rev-parse HEAD > "${APP_ROOT}/.deploy-last-known-good"
fi

echo "Pre-sync working tree summary:"
git status -sb || true
if [[ -f "${APP_ROOT}/ecosystem.config.cjs" ]]; then
  echo "Local PM2 ecosystem.config.cjs present (untracked or ignored — preserved across sync)."
fi
if [[ -e "${APP_ROOT}/path" ]]; then
  echo "::warning::Untracked empty file 'path' exists in app root (likely accidental); not removed by this script."
fi

echo "Syncing to approved ref..."

if [[ -n "${TAKIIA_DEPLOY_SHA:-}" ]]; then
  if [[ ! "${TAKIIA_DEPLOY_SHA}" =~ ^[0-9a-f]{40}$ ]]; then
    echo "::error::TAKIIA_DEPLOY_SHA must be a 40-character commit SHA"
    exit 1
  fi
  git fetch origin main
  if ! git merge-base --is-ancestor "${TAKIIA_DEPLOY_SHA}" origin/main 2>/dev/null; then
    echo "::error::TAKIIA_DEPLOY_SHA must be an ancestor of origin/main"
    exit 1
  fi
  if [[ "${ENFORCE_MAIN_ONLY}" == "1" ]]; then
    if ! git diff --quiet || ! git diff --cached --quiet; then
      echo "::warning::Tracked files differ from index; aligning to CI commit ${TAKIIA_DEPLOY_SHA} (untracked files such as ecosystem.config.cjs are kept)."
    fi
    git checkout --force --detach "${TAKIIA_DEPLOY_SHA}"
  else
    git checkout --detach "${TAKIIA_DEPLOY_SHA}"
  fi
  echo "Git sync complete (pinned SHA $(git rev-parse --short HEAD))"
  exit 0
fi

if [[ "${DEPLOY_REF}" =~ ^[0-9a-f]{40}$ ]]; then
  git fetch --depth=1 origin "${DEPLOY_REF}"
  git checkout --detach "${DEPLOY_REF}"
else
  git fetch origin "${DEPLOY_REF}"
  git checkout "${DEPLOY_REF}"
  git pull --ff-only origin "${DEPLOY_REF}"
fi

echo "Git sync complete"
