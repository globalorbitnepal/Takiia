# Production readiness progress (verified outcomes)

Evidence only ? no secrets. Last verified: **2026-10-23** (post PR #4 deploy).

## Consolidated criteria

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | `origin/main` SHA | **PASS** | `b68f49f3877ac7ad1261515195dbb056f139350e` (PR #4 merge) |
| 2 | CI on `b68f49f` | **PASS** | [run 39850453991](https://github.com/globalorbitnepal/Takiia/actions/runs/39850453991) success |
| 3 | PR #4 SCRIPT_DIR fix on server | **PASS** | `validate-db-backup.sh` uses `_VALIDATE_LIB_DIR`; git at `b68f49f` |
| 4 | Production Git SHA | **PASS** | `git rev-parse` = `b68f49f?` |
| 5 | `.deploy-metadata.json` | **PASS** | `deployedAt` `2026-10-22T20:44:35Z` |
| 6 | `remote-deploy.sh` exit 0 (full pipeline) | **PASS** | `TAKIIA_SKIP_GIT_SYNC=1` run after `verify-health.sh` retry patch on server; `REMOTE_DEPLOY_EXIT=0`, `verify-deploy` OK |
| 7 | Prior deploy attempts (same SHA) | **FAIL** | Exit **1** ? immediate `curl` to web :3034 after PM2 reload (race); **not** SCRIPT_DIR |
| 8 | `verify-health.sh` in git `main` | **PENDING** | Retry logic on server via hotfix; branch `fix/verify-health-retry` not merged |
| 9 | Public `/health` + commit | **PASS** | `b68f49f?` |
| 10 | `/health/ready` | **PASS** | database ok |
| 11 | Pricing | **PASS** | HTTP 200 |
| 12 | Migrations | **PASS** | up to date |
| 13 | PM2 | **PASS** | `takiia-api`, `takiia-web` online |
| 14 | SSH fingerprint | **PASS** | `SHA256:OcDdcR3jir76uLahlZtQfMcI+VOwgkiV2KdtT0P2U+s` |
| 15 | Verified DB backup | **PASS** | `takiia_db_backup_20261023_013309.dump`, `sha256sum -c` OK |
| 16 | Backup script executable | **PASS** | `chmod +x` applied `takiia-db-backup.sh` (was blocking cron) |
| 17 | Scheduled cron execution | **NOT RUN** | Server ~20:44 UTC Oct 22; cron `15 2 * * *` UTC ? first window not elapsed; `cron.log` shows failed manual line + permission denied (pre-fix), not a successful scheduled run |
| 18 | Off-site encrypted backup | **BLOCKED** | No approved destination/credentials; `restic` missing |
| 19 | Isolated restore test | **BLOCKED** | `takiia_app` lacks `CREATEDB` |
| 20 | Upload API persistence | **NOT RUN** | No authorized test account |
| 21 | GA Deploy Production | **NOT RUN** | No successful workflow on `b68f49f` |
| 22 | `ERR_ERL_UNEXPECTED_X_FORWARDED_FOR` | **WARN** | `express-rate-limit` sees `X-Forwarded-For` from edge; API has no `trust proxy` ? log noise, not changed this pass |

**Overall:** Production matches `main` at `b68f49f` with verified full deploy script success after health-retry hotfix. **Not 100% ready** until scheduled backup proof, off-site copy, restore test, upload API test, GA deploy, and merged `verify-health` retry on `main`.

## Deploy notes (2026-10-22 UTC)

- Synced `TAKIIA_DEPLOY_SHA=b68f49f` after stashing local `validate-db-backup.sh` drift.
- Embedded health step passes with 30s retry on localhost web/API (hotfix on server).
- `verify-deploy.sh` confirmed commit and marketing routes.

## Open work

1. Merge `fix/verify-health-retry` (or equivalent) so stock `main` deploy exits 0 without hotfix.
2. After 02:15 UTC, confirm new dump + `cron.log` entry from scheduler.
3. Optional: `trust proxy` for API behind Cloudflare/Nginx (rate-limit warnings).
4. GA deploy, off-site backup, DBA restore DB, upload smoke test.
