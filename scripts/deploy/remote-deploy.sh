#!/usr/bin/env bash
# Server-side deploy — Takiia PM2 apps only. Build completes before PM2 reload/start.
set -euo pipefail

APP_ROOT="${TAKIIA_APP_ROOT:-/srv/apps/takiia}"
ECOSYSTEM_CONFIG="${TAKIIA_ECOSYSTEM_CONFIG:-${APP_ROOT}/ecosystem.config.cjs}"
BACKUP_ROOT="${TAKIIA_BACKUP_ROOT:-/var/backups/takiia}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/load-env.sh
source "${SCRIPT_DIR}/lib/load-env.sh"
# shellcheck source=lib/database.sh
source "${SCRIPT_DIR}/lib/database.sh"
# shellcheck source=lib/migrate.sh
source "${SCRIPT_DIR}/lib/migrate.sh"
# shellcheck source=lib/pm2-takiia.sh
source "${SCRIPT_DIR}/lib/pm2-takiia.sh"
# shellcheck source=lib/write-deploy-metadata.sh
source "${SCRIPT_DIR}/lib/write-deploy-metadata.sh"
# shellcheck source=lib/validate-db-backup.sh
source "${SCRIPT_DIR}/lib/validate-db-backup.sh"

if [[ "$(whoami)" != "takiia" ]]; then
  echo "::error::remote-deploy.sh must run as user takiia"
  exit 1
fi

cd "${APP_ROOT}"

if [[ "${TAKIIA_SKIP_GIT_SYNC:-0}" != "1" ]]; then
  bash "${SCRIPT_DIR}/git-sync.sh"
fi

if [[ ! -f "${ECOSYSTEM_CONFIG}" ]]; then
  echo "::error::Missing PM2 ecosystem file"
  exit 1
fi

load_env_file "${APP_ROOT}/apps/web/.env.production" NEXT_PUBLIC_API_URL

echo "Installing dependencies..."
npm ci

echo "Building (must succeed before PM2 start/reload)..."
npm run build --workspace @takiia/shared
npm run build --workspace @takiia/api
npm run build --workspace @takiia/web

LOAD_ENV_STRICT_PERMS=1 load_env_file "${APP_ROOT}/apps/api/.env" HOST PORT NODE_ENV

if [[ -n "${DATABASE_URL:-}" ]]; then
  if ! validate_takiia_database_url "${DATABASE_URL}"; then
    echo "::error::DATABASE_URL must use database name takiia_db only"
    exit 1
  fi

  set +e
  takiia_prisma_migrate_pending "${APP_ROOT}"
  pending_code=$?
  set -e

  if [[ "${pending_code}" -eq 2 ]]; then
    exit 1
  fi

  if [[ "${pending_code}" -eq 0 ]]; then
    if [[ "${TAKIIA_CONFIRM_DB_BACKUP:-}" != "yes" ]]; then
      echo "::error::Pending migrations require TAKIIA_CONFIRM_DB_BACKUP=yes (this does not create a backup)."
      exit 1
    fi
    if [[ -z "${TAKIIA_DB_BACKUP_PATH:-}" ]] || [[ ! -f "${TAKIIA_DB_BACKUP_PATH}" ]] || [[ ! -r "${TAKIIA_DB_BACKUP_PATH}" ]] || [[ ! -s "${TAKIIA_DB_BACKUP_PATH}" ]]; then
      echo "::error::Pending migrations require a readable, non-empty TAKIIA_DB_BACKUP_PATH."
      exit 1
    fi
    case "${TAKIIA_DB_BACKUP_PATH}" in
      "${BACKUP_ROOT}"/*) ;;
      *)
        echo "::error::Backup path must be under ${BACKUP_ROOT}/"
        exit 1
        ;;
    esac
    if printf '%s' "${TAKIIA_DB_BACKUP_PATH}" | grep -qE '[`$;|&><()]'; then
      echo "::error::TAKIIA_DB_BACKUP_PATH contains disallowed characters."
      exit 1
    fi
    if ! takiia_validate_db_backup_file "${TAKIIA_DB_BACKUP_PATH}"; then
      exit 1
    fi
    echo "Applying Prisma migrations (pending migrations detected)..."
    if ! npm run db:migrate:deploy --workspace @takiia/api; then
      echo "::error::prisma migrate deploy failed; PM2 was not reloaded."
      exit 1
    fi
  else
    echo "No Prisma migration directories or no pending migrations; skipping migrate deploy."
  fi
else
  echo "DATABASE_URL not set — skipping migration logic"
fi

takiia_write_deploy_metadata "${APP_ROOT}"

echo "Starting or reloading Takiia PM2 processes only..."
pm2_takiia_start_or_reload_both "${ECOSYSTEM_CONFIG}"

if ! bash "${SCRIPT_DIR}/verify-health.sh"; then
  echo "::error::Health checks failed after PM2 start/reload. Last known-good SHA (if recorded): see .deploy-last-known-good"
  exit 1
fi

expected_sha="${TAKIIA_DEPLOY_SHA:-${TAKIIA_EXPECTED_SHA:-}}"
if [[ -n "${expected_sha}" ]]; then
  export TAKIIA_EXPECTED_SHA="${expected_sha}"
  if ! bash "${SCRIPT_DIR}/verify-deploy.sh"; then
    echo "::error::Deploy verification failed; production may still be on an older build."
    exit 1
  fi
else
  echo "::warning::TAKIIA_DEPLOY_SHA not set; skipping commit and marketing build verification"
fi

git rev-parse HEAD > "${APP_ROOT}/.deploy-last-known-good"
echo "Deployed commit: $(git rev-parse HEAD)"

echo "Deploy complete"
