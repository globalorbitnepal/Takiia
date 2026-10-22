# Production readiness progress (verified outcomes)

Evidence only ? no secrets. Last verified: **2026-10-23** after deploy of `7e96dd6`.

## Consolidated criteria

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | `origin/main` SHA | **PASS** | `7e96dd6287d03974e5a78286e41e2bdebb049ae9` (PR #3 merge) |
| 2 | CI on `7e96dd6` | **PASS** | [run 39848346280](https://github.com/globalorbitnepal/Takiia/actions/runs/39848346280) success |
| 3 | Production Git SHA | **PASS** | `/srv/apps/takiia` `git rev-parse` = `7e96dd6?` (2026-10-22T20:30Z deploy) |
| 4 | `.deploy-metadata.json` | **PASS** | commit `7e96dd6?`, `deployedAt` `2026-10-22T20:30:09Z` |
| 5 | Public `/health` commit | **PASS** | API returns `commit` `7e96dd6?` |
| 6 | `/health/ready` + DB | **PASS** | HTTP 200, `database: ok` |
| 7 | Pricing page | **PASS** | HTTP 200 |
| 8 | Migrations | **PASS** | `prisma migrate status`: up to date |
| 9 | PM2 Takiia only | **PASS** | `takiia-api`, `takiia-web` online after reload |
| 10 | SSH host fingerprint | **PASS** | ED25519 `SHA256:OcDdcR3jir76uLahlZtQfMcI+VOwgkiV2KdtT0P2U+s` |
| 11 | SSH deploy (documented scripts) | **PASS** | `git-sync` + `TAKIIA_SKIP_GIT_SYNC=1 remote-deploy` to `7e96dd6`; build + PM2 reload OK |
| 12 | `remote-deploy` health hook | **FAIL** | Exit 1: `lib/verify-health.sh` (SCRIPT_DIR clobbered by `validate-db-backup.sh`); manual `verify-health.sh` **PASS** |
| 13 | GitHub Actions Deploy Production | **NOT RUN** | No successful GA deploy on `7e96dd6`; auto deploy workflow **skipped** |
| 14 | Verified manual DB backup | **PASS** | `takiia_db_backup_20261023_013309.dump`, `sha256sum -c` OK (85?967 B) |
| 15 | Scheduled cron backup execution | **NOT RUN** | Cron `15 2 * * *` UTC; server time at verify ~20:30 UTC Oct 22 ? first window not yet elapsed; `cron.log` not a scheduled run |
| 16 | Off-site encrypted backup | **BLOCKED** | `restic` missing; no approved destination/credentials |
| 17 | Isolated restore test | **BLOCKED** | `takiia_app` cannot `CREATEDB` |
| 18 | Upload FS path | **PASS** | `/srv/apps/takiia/uploads` (prior probe) |
| 19 | Upload API persistence | **NOT RUN** | No authorized test account |
| 20 | Deploy SCRIPT_DIR fix | **PENDING** | Branch `fix/deploy-script-dir-clobber` (not merged) |

**Overall:** Production runs merged deploy fixes at `7e96dd6`, but **not 100% production-ready** until scheduled backup proof, off-site copy, isolated restore, upload API test, GA deploy success, and SCRIPT_DIR fix merge/deploy.

## Deploy notes (2026-10-22 UTC)

- Server had hot-patched `migrate.sh`; stashed before `TAKIIA_DEPLOY_SHA=7e96dd6` sync.
- Several `scripts/**/*.sh` on server still contained CRLF at verify time; `.gitattributes` on `main` limits recurrence.
- `remote-deploy.sh` failed final step due to `SCRIPT_DIR` overwrite when sourcing `validate-db-backup.sh` (fix in flight).

## Local QA (`7e96dd6` / post-merge)

| Check | Result |
|-------|--------|
| API tests | 24 passed, 6 integration skipped |
| typecheck / lint | PASS |
| `npm run build` | PASS |
| `ci-validate-deploy-scripts.sh` | PASS (Git Bash) |
| `format:check` (Windows) | **FAIL** (CRLF/Prettier drift; CI on Linux passed) |

## Open work

1. Merge PR for `fix/deploy-script-dir-clobber` and redeploy or patch server `validate-db-backup.sh`.
2. Confirm first **02:15 UTC** cron backup + `cron.log` + new dump checksum.
3. GA **Deploy Production** on `main` HEAD (verify fingerprint secret).
4. DBA: restore-test database + `CREATEDB`.
5. Off-site: approve bucket/credentials, install `restic`.
6. Attachment upload smoke test with dedicated test user.
