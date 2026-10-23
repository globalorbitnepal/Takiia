#!/usr/bin/env bash
# Syntax-check deploy scripts and run offline verify-deploy fixture tests (no production access).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

for rel in \
  verify-deploy.sh \
  remote-deploy.sh \
  git-sync.sh \
  verify-health.sh \
  ci-validate-deploy-scripts.sh \
  lib/write-deploy-metadata.sh \
  lib/load-env.sh \
  lib/migrate.sh \
  lib/pm2-takiia.sh \
  lib/database.sh \
  lib/validate-db-backup.sh; do
  path="${SCRIPT_DIR}/${rel}"
  head -n 1 "${path}" | grep -q '^#!/usr/bin/env bash$'
  bash -n "${path}"
done

BACKUP_DIR="$(cd "${SCRIPT_DIR}/../backup" && pwd)"
for rel in takiia-db-backup.sh takiia-restore-test.sh; do
  path="${BACKUP_DIR}/${rel}"
  head -n 1 "${path}" | grep -q '^#!/usr/bin/env bash$'
  bash -n "${path}"
done

node --check "${SCRIPT_DIR}/start-web.cjs"
node --check "${SCRIPT_DIR}/lib/patch-takiia-web-ecosystem.mjs"

node "${SCRIPT_DIR}/ci-verify-deploy.mjs"
