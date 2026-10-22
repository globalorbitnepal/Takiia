# Production readiness progress (verified outcomes)

Evidence only ? no secrets. Last verified: **2026-10-23** (UTC+5:45 local).

## Consolidated criteria

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | Repository / branch / commit verified | **PASS** | `origin/main` = `0792fa21e2de66fa9f63c0df09a5c8fd63648cbb`; feature branch `fix/deploy-shell-scripts-lf` pushed (see below for HEAD after latest push) |
| 2 | PR for `fix/deploy-shell-scripts-lf` | **BLOCKED** | GitHub API: **no open PR**; open via [compare main?fix/deploy-shell-scripts-lf](https://github.com/globalorbitnepal/Takiia/compare/main...fix/deploy-shell-scripts-lf?expand=1) |
| 3 | Feature branch diff + local tests | **PASS** (pre-push) | `.gitattributes`, `migrate.sh` errexit fix, `migratePending.test.ts`, ops docs; `npm test` API **24 passed**, 6 integration skipped; `ci-validate-deploy-scripts.sh` OK (Git Bash) |
| 4 | CI green on feature branch | **NOT RUN** | CI runs on `pull_request` to `main`; requires PR |
| 5 | Merge to `main` | **NOT RUN** | Awaiting explicit approval |
| 6 | Production Git SHA / metadata / health | **PASS** | Server `git rev-parse` = `0792fa21?`; `.deploy-metadata.json` commit + `deployedAt` `2026-10-22T19:47:39Z`; `https://api.takiia.com/health` `commit` matches |
| 7 | DB ready / migrations | **PASS** | `prisma migrate status`: schema up to date (`init`, `saas_platform`) |
| 8 | Public pricing | **PASS** | `https://takiia.com/pricing` HTTP **200** |
| 9 | `/health/ready` | **PASS** | HTTP **200**, database ok |
| 10 | GitHub variable `TAKIIA_PRODUCTION_DEPLOY` | **BLOCKED** | Requires repo admin UI/API auth (not verified from this workstation) |
| 11 | SSH host fingerprint (operator) | **PASS** | `known_hosts` ED25519: `SHA256:OcDdcR3jir76uLahlZtQfMcI+VOwgkiV2KdtT0P2U+s`; interactive SSH as `takiia` works with deploy key |
| 12 | GitHub secret fingerprint value | **NOT RUN** | Cannot read secret; must match row 11 in GitHub ? Settings ? Secrets |
| 13 | Deploy Production on `0792fa2` | **FAIL** | Only workflow run: `44a3f5f` ? **failure** ([run 39828491633](https://github.com/globalorbitnepal/Takiia/actions/runs/39828491633)); **no** successful GA deploy for `0792fa2` |
| 14 | Controlled GA deploy prepared | **PASS** | [github-deploy-checklist.md](github-deploy-checklist.md); migrations current ? `confirm_db_backup=no` |
| 15 | Manual DB backup | **PASS** | `takiia_db_backup_20261023_013309.dump` (85?967 B); `sha256sum -c` **OK**; older files preserved under `/var/backups/takiia/` |
| 16 | Daily backup cron | **PASS** (install) | `15 2 * * *` ? `takiia-db-backup.sh` >> `/var/backups/takiia/cron.log`; log **writable** |
| 17 | First scheduled cron execution | **NOT RUN** | Next window 02:15 **UTC**; `cron.log` has manual/test lines only (1 line at last check) |
| 18 | Off-site encrypted backup | **BLOCKED** | `restic` not installed; [off-site-backup-prerequisites.md](off-site-backup-prerequisites.md) |
| 19 | Isolated restore test | **BLOCKED** | `takiia_app` lacks `CREATEDB`; [restore-test-prerequisites.md](restore-test-prerequisites.md) |
| 20 | Upload path / FS write | **PASS** | PM2 cwd `/srv/apps/takiia` ? `./uploads` = `/srv/apps/takiia/uploads`; probe write/delete **OK** |
| 21 | Upload API persistence | **NOT RUN** | Requires authenticated attachment flow; no production user files touched |
| 22 | CI on `main` (`0792fa2`) | **PASS** | [CI run 39837623879](https://github.com/globalorbitnepal/Takiia/actions/runs/39837623879) **success** |

**Overall:** Not 100% production-ready until PR merge, CI on PR, successful **Deploy Production** on merged SHA, first cron backup run, off-site copy, isolated restore, and upload API test are verified.

## Release

| Item | Value |
|------|--------|
| `origin/main` | `0792fa21e2de66fa9f63c0df09a5c8fd63648cbb` (PR #2) |
| Production deploy method (current) | Workflow-equivalent SSH (`git-sync.sh` + `remote-deploy.sh`), not successful GA UI run |
| Feature branch | `fix/deploy-shell-scripts-lf` ? LF normalization + `migrate.sh` fix + tests/docs |

## Deploy path notes

- **CRLF** on Linux broke shell scripts until `sed` strip on server; **`.gitattributes`** on feature branch prevents recurrence.
- **`migrate.sh`** re-enabled `set -e` before `return 1` when DB up to date (fixed on branch; server hot-patched once).

## Database (read-only)

| Item | Value |
|------|--------|
| DB / role | `takiia_db` / `takiia_app` |
| Migrations | Up to date |

## Local QA (feature branch workstation)

| Check | Result |
|-------|--------|
| `@takiia/shared` build | PASS |
| `npm test` (@takiia/api) | 24 passed, 6 skipped |
| `npm run typecheck` (api) | PASS |
| `npm run lint` | PASS |
| `ci-validate-deploy-scripts.sh` | PASS (Git Bash) |

## Open work (operator)

1. Open PR from `fix/deploy-shell-scripts-lf` ? wait for CI ? merge with approval.
2. Re-run **Deploy Production** on new `main` SHA per checklist; verify fingerprint secret.
3. After 02:15 UTC, confirm new dump + `cron.log` append.
4. DBA: empty `takiia_dr_test_*` DB + `CREATEDB` or superuser; run `takiia-restore-test.sh`.
5. Approve off-site bucket/credentials; install `restic` and run example script.
6. Auth smoke test: attachment upload to `/srv/apps/takiia/uploads` with test account.
