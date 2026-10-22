# Production readiness progress (verified outcomes)

Evidence only — no secrets. Updated after continued audit pass.

## Repository and GitHub

| Item                          | Status        | Evidence (2026-10-23)                                                                  |
| ----------------------------- | ------------- | -------------------------------------------------------------------------------------- |
| Feature branch                | **VERIFIED**  | `fix/deploy-prisma-before-api-build` @ `a47ada5` (local = `origin`)                    |
| `main`                        | **VERIFIED**  | `44a3f5f2af5cecb8c57b365332541ae3de653b2b`                                             |
| Working tree                  | **VERIFIED**  | Clean before new commit in this pass                                                   |
| Open PR to `main`             | **NOT FOUND** | `GET /repos/.../pulls?head=globalorbitnepal:fix/deploy-prisma-before-api-build` → `[]` |
| PR creation                   | **BLOCKED**   | No `gh` CLI; no `GITHUB_TOKEN` / `GH_TOKEN` in environment                             |
| PR CI                         | **NOT RUN**   | CI triggers on PR to `main`; no PR exists yet                                          |
| Local `format:check`          | **PASS**      | After Prettier fix on branch (2026-10-23)                                              |
| Deploy script order on branch | **PASS**      | `remoteDeployOrder.test.ts` + `ci-verify-deploy.mjs`                                   |
| Deploy script order on `main` | **FAIL**      | Build before `db:generate` / migrate block                                             |

**Open PR:** https://github.com/globalorbitnepal/Takiia/compare/main...fix/deploy-prisma-before-api-build?expand=1

## Production (last read-only SSH; re-verify after deploy)

| Item                      | Status              | Evidence                                       |
| ------------------------- | ------------------- | ---------------------------------------------- |
| Git at `/srv/apps/takiia` | **STALE vs branch** | `44a3f5f` (matches `main`, not feature branch) |
| PM2 Takiia apps           | **VERIFIED**        | `takiia-api`, `takiia-web` online              |
| DB identity               | **VERIFIED**        | `takiia_db` / `takiia_app`; 2 migrations       |
| `.deploy-metadata.json`   | **MISSING**         | Health has no `commit` field                   |
| Backup checksum           | **VERIFIED**        | `takiia_db_backup_20261023_001716.dump` OK     |
| Daily backup cron         | **NOT INSTALLED**   | No Takiia cron/timer entries                   |
| Off-site restic           | **NOT INSTALLED**   | `restic` absent on server                      |
| Uploads directory         | **MISSING**         | `apps/api/uploads` absent — see uploads doc    |

## Public (2026-10-23)

| URL                             | Result                    |
| ------------------------------- | ------------------------- |
| `https://takiia.com/pricing`    | HTTP **200**              |
| `https://api.takiia.com/health` | `status: ok`; no `commit` |

## Deployment workflow (repository review)

| Check                        | Status         | Notes                                                                         |
| ---------------------------- | -------------- | ----------------------------------------------------------------------------- |
| `workflow_dispatch` only     | **PASS**       | `deploy-production.yml`                                                       |
| Pins `main` SHA via CI gate  | **PASS**       | `guard` job checks required check-runs on `main` HEAD                         |
| SSH user `takiia`            | **PASS**       | Enforced in workflow and remote script                                        |
| Host fingerprint secret      | **REQUIRED**   | `fingerprint:` on `appleboy/ssh-action`; value not visible                    |
| Expected ED25519 fingerprint | **VERIFIED**   | `SHA256:OcDdcR3jir76uLahlZtQfMcI+VOwgkiV2KdtT0P2U+s` from local `known_hosts` |
| `TAKIIA_PRODUCTION_DEPLOY`   | **UNVERIFIED** | Repository variable; needs GitHub UI                                          |
| `TAKIIA_AUTO_DEPLOY`         | **DISABLED**   | Auto workflow block commented in YAML                                         |

## Prepared but not executed on production

| Capability                           | Status                                                   |
| ------------------------------------ | -------------------------------------------------------- |
| `scripts/backup/takiia-db-backup.sh` | **READY** (not run on prod this pass)                    |
| Daily cron example                   | `scripts/backup/install-daily-backup.cron.example`       |
| Off-site template                    | `scripts/backup/takiia-offsite-restic.sh.example`        |
| Restore test script                  | `scripts/backup/takiia-restore-test.sh` (dry by default) |
| Ops runbooks                         | `docs/operations/*.md`                                   |
| Uploads strategy                     | `docs/operations/uploads-and-persistence.md`             |

## Blockers (owner action)

1. Open PR (compare URL above) — or grant GitHub CLI/token for agent-created PR.
2. Merge after green CI (**explicit approval**).
3. Confirm `TAKIIA_PRODUCTION_SSH_HOST_FINGERPRINT` in GitHub matches verified host key.
4. Run **Deploy Production** on merged `main` SHA (**explicit approval**).
5. Approve cron install, off-site init, isolated restore test separately.
