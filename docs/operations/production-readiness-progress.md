# Production readiness progress (verified outcomes)

Evidence only ? no secrets. Full audit after **PR #2** merge (2026-10-23).

## Repository and GitHub

| Item                          | Status         | Evidence                                                                            |
| ----------------------------- | -------------- | ----------------------------------------------------------------------------------- |
| PR #2                         | **MERGED**     | `merge_commit_sha` = `0792fa21e2de66fa9f63c0df09a5c8fd63648cbb`                     |
| `origin/main`                 | **VERIFIED**   | `0792fa21e2de66fa9f63c0df09a5c8fd63648cbb`                                          |
| Local `main`                  | **AHEAD 1**    | Unpushed commit `ef27685` (progress doc only) ? use docs PR, not direct push        |
| CI on `0792fa2`               | **PASS**       | `Validate workflow syntax` + `Build and quality checks` success                     |
| Deploy Production @ `0792fa2` | **NOT RUN**    | No workflow run for merge SHA                                                       |
| Last Deploy Production        | **FAIL**       | `head_sha` `44a3f5f`, `2026-10-22T18:06:37Z` (SSH step; fingerprint/auth suspected) |
| `TAKIIA_PRODUCTION_DEPLOY`    | **UNVERIFIED** | GitHub variables API not authenticated from audit environment                       |

## Production server (read-only SSH 2026-10-23)

| Item                            | Status            | Evidence                                                                                      |
| ------------------------------- | ----------------- | --------------------------------------------------------------------------------------------- |
| Git HEAD                        | **BEHIND `main`** | `44a3f5f2af5cecb8c57b365332541ae3de653b2b`, detached HEAD                                     |
| Merged deploy fix on disk       | **NO**            | `remote-deploy.sh`: `npm ci` line 41, `Building?` line 43 ? **no `db:generate` before build** |
| `scripts/backup/` on server     | **MISSING**       | Directory absent until deploy syncs `0792fa2`                                                 |
| `.deploy-metadata.json`         | **MISSING**       |                                                                                               |
| `apps/api/.env`                 | **OK**            | mode `600`, owner `takiia`                                                                    |
| PM2 `takiia-api` / `takiia-web` | **online**        |                                                                                               |
| PM2 `exec cwd` (api)            | **VERIFIED**      | `/srv/apps/takiia` (not `apps/api`)                                                           |
| Default upload path             | **INFERRED**      | `UPLOAD_DIR` default `./uploads` ? **`/srv/apps/takiia/uploads`** ? **directory missing**     |
| PostgreSQL                      | **VERIFIED**      | 16.15; DB `takiia_db`, role `takiia_app`; **33** public tables                                |
| Migrations applied              | **VERIFIED**      | `20261021200000_init`, `20261022020000_saas_platform` (both finished)                         |
| `Plan` rows                     | **VERIFIED**      | **4**                                                                                         |
| Backup `?20261023_001716.dump`  | **VERIFIED**      | sha256 **OK**; **33** `TABLE DATA` entries                                                    |
| Daily cron                      | **NOT INSTALLED** |                                                                                               |
| restic                          | **NOT INSTALLED** |                                                                                               |

## Public endpoints (2026-10-23)

| Endpoint                              | Result                              |
| ------------------------------------- | ----------------------------------- |
| `https://takiia.com/pricing`          | HTTP **200**                        |
| `https://api.takiia.com/health`       | `status: ok`; **no `commit`**       |
| `https://api.takiia.com/health/ready` | HTTP **200**; `checks.database: ok` |

## Deployment readiness

| Prerequisite                           | State                              |
| -------------------------------------- | ---------------------------------- |
| Correct `remote-deploy.sh` on `main`   | **YES** (`0792fa2`)                |
| CI green on `0792fa2`                  | **YES**                            |
| Production synced to `0792fa2`         | **NO**                             |
| SSH host fingerprint secret            | **UNKNOWN** (prior deploy failure) |
| Off-site / daily backup / restore test | **NOT EXECUTED**                   |

## Next gated action

**Deploy Production** workflow on `main` @ **`0792fa2`** with explicit approval; verify `TAKIIA_PRODUCTION_SSH_HOST_FINGERPRINT` = `SHA256:OcDdcR3jir76uLahlZtQfMcI+VOwgkiV2KdtT0P2U+s` before run.
