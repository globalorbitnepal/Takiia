# Production readiness progress (verified outcomes)

Last updated from autonomous engineering pass. No secrets in this file.

## Repository

| Item                    | State                                | Evidence                                             |
| ----------------------- | ------------------------------------ | ---------------------------------------------------- |
| Deploy order fix branch | `fix/deploy-prisma-before-api-build` | `remote-deploy.sh` generates Prisma before API build |
| `main` deploy script    | Build before generate/migrate        | `git show main:scripts/deploy/remote-deploy.sh`      |
| Feature branch HEAD     | `651fa71` (pushed to origin)         | Deploy fix + backup scripts, tests, ops docs          |

## Production (read-only SSH)

| Item                            | State                                                      |
| ------------------------------- | ---------------------------------------------------------- |
| Git HEAD at `/srv/apps/takiia`  | `44a3f5f2af5cecb8c57b365332541ae3de653b2b`                 |
| PM2 `takiia-api` / `takiia-web` | online                                                     |
| DB                              | `takiia_db` / `takiia_app`, 33 public tables, 2 migrations |
| `.deploy-metadata.json`         | missing                                                    |
| `apps/api/.env`                 | mode `600`, owner `takiia`                                 |
| Latest verified dump            | `takiia_db_backup_20261023_001716.dump` (85 967 bytes)     |
| Daily backup cron/timer         | not configured                                             |
| restic                          | not installed                                              |
| `apps/api/uploads`              | directory missing on server                                |

## Blockers (require approval)

- Merge deploy-fix PR to `main`
- Fix GitHub `TAKIIA_PRODUCTION_SSH_HOST_FINGERPRINT` if deploy SSH fails
- Gated Deploy Production after merge
- Install backup cron / off-site restic / isolated restore test

## Public checks

- `https://takiia.com/pricing` — HTTP 200 when last checked
- `https://api.takiia.com/health` — ok; no `commit` without metadata file
