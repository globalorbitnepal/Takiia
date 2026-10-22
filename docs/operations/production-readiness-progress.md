# Production readiness progress (verified outcomes)

Evidence only ? no secrets. Last verified: **2026-10-23** (PR #5 opened).

## Consolidated criteria

| #   | Criterion                                | Status      | Evidence                                                                                                              |
| --- | ---------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------- |
| 1   | `origin/main`                            | **PASS**    | `b68f49f3877ac7ad1261515195dbb056f139350e` (PR #4)                                                                    |
| 2   | Production SHA                           | **PASS**    | `b68f49f?` ? matches main at last check                                                                               |
| 3   | Health retry in git `main`               | **BLOCKED** | Fix on [PR #5](https://github.com/globalorbitnepal/Takiia/pull/5) `fix/verify-health-retry` ? **not merged**          |
| 4   | Stock `remote-deploy` exit 0 (no hotfix) | **FAIL**    | Server `verify-health.sh` has hotfix (`wait_for_health`); git at `b68f49f` without retry until PR #5 merge + redeploy |
| 5   | Last full deploy exit 0                  | **PASS**    | 2026-10-22 UTC with hotfixed `verify-health` + `verify-deploy` for `b68f49f`                                          |
| 6   | CI on `b68f49f`                          | **PASS**    | [39850453991](https://github.com/globalorbitnepal/Takiia/actions/runs/39850453991)                                    |
| 7   | CI on PR #5                              | **PASS**    | [39852315765](https://github.com/globalorbitnepal/Takiia/actions/runs/39852315765) on `a289313`                          |
| 8   | Public health / ready / pricing          | **PASS**    | commit `b68f49f?`, DB ok, pricing 200                                                                                 |
| 9   | Migrations                               | **PASS**    | up to date                                                                                                            |
| 10  | PM2 Takiia only                          | **PASS**    | `takiia-api`, `takiia-web` online                                                                                     |
| 11  | SSH fingerprint                          | **PASS**    | `SHA256:OcDdcR3jir76uLahlZtQfMcI+VOwgkiV2KdtT0P2U+s`                                                                  |
| 12  | Verified manual backup                   | **PASS**    | `takiia_db_backup_20261023_013309.dump`, sha256 OK                                                                    |
| 13  | Backup script executable                 | **PASS**    | `chmod +x` on `takiia-db-backup.sh`                                                                                   |
| 14  | Scheduled cron backup                    | **NOT RUN** | Server ~20:46 UTC Oct 22; cron `15 2 * * *` UTC ? window not elapsed; `cron.log` shows old failed lines only          |
| 15  | Off-site encrypted backup                | **BLOCKED** | `restic` missing; [off-site-backup-prerequisites.md](off-site-backup-prerequisites.md)                                |
| 16  | Isolated restore test                    | **BLOCKED** | DBA / `CREATEDB` + empty `takiia_dr_test_*` ? not attempted without provisioning                                      |
| 17  | Upload API persistence                   | **NOT RUN** | No authorized test account                                                                                            |
| 18  | GA Deploy Production                     | **NOT RUN** | ?                                                                                                                     |
| 19  | `ERR_ERL_UNEXPECTED_X_FORWARDED_FOR`     | **WARN**    | See proxy note below                                                                                                  |

**Overall:** Not 100% ready until PR #5 merged, redeploy from merged `main` without hotfix, scheduled backup proof, off-site, restore test, upload API test.

## Health retry design (PR #5)

- Up to **30** attempts, **1s** apart; fails with `health check failed after 30s`.
- Each attempt requires curl success **and** JSON `"status":"ok"` (unhealthy app still fails).
- Localhost **127.0.0.1** ports **3033** / **3034** only.
- Tests: `apps/api/src/tests/verifyHealthRetry.test.ts`.

## Proxy / rate-limit note (no change applied)

- Public traffic: Cloudflare ? Nginx (sets `X-Forwarded-For`) ? API on `127.0.0.1:3033`.
- Express `trust proxy` is **false**; `express-rate-limit` warns when `X-Forwarded-For` is present.
- A safe future fix is likely **`trust proxy` = 1** (single Nginx hop to loopback), **not** `true` (trust all). Requires explicit approval and verification on origin.

## Open work

1. **Merge PR #5** (after approval) ? redeploy `main` HEAD with `remote-deploy.sh` (no hotfix).
2. After **02:15 UTC**, verify cron dump + log.
3. Off-site credentials; DBA restore DB; upload test user.
4. Optional: `trust proxy` for API behind Nginx.
