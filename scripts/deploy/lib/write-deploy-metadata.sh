#!/usr/bin/env bash
# Write non-secret deploy markers for health checks (no credentials).
set -euo pipefail

takiia_write_deploy_metadata() {
  local app_root="$1"
  local sha
  sha="$(git -C "${app_root}" rev-parse HEAD)"
  local deployed_at
  deployed_at="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  printf '{"commit":"%s","deployedAt":"%s"}\n' "${sha}" "${deployed_at}" > "${app_root}/.deploy-metadata.json"
  chmod 600 "${app_root}/.deploy-metadata.json" 2>/dev/null || true
  echo "Recorded deploy metadata for ${sha}"
}
