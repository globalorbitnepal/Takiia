# Why GitHub updates but takiia.com does not

## Root cause (evidence-based)

Pushing to `main` **only runs CI**. It does **not** update the production server.

| Layer                         | What happens                                                                                                                                 | Evidence                                                                                 |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| **No deploy trigger on push** | `deploy-production.yml` is **`workflow_dispatch` only**; the `workflow_run` trigger remains commented out.                                   | `.github/workflows/deploy-production.yml` lines 8–17, 16–17                              |
| **Deploy gate off**           | The guard job exits unless repository variable **`TAKIIA_PRODUCTION_DEPLOY=true`**. While `false`/unset, **Deploy Production never runs**.   | Same file, lines 50–52                                                                   |
| **Auto-deploy skipped**       | `deploy-on-ci-success.yml` jobs run only when **`TAKIIA_AUTO_DEPLOY`** and **`TAKIIA_PRODUCTION_DEPLOY`** are both `true`.                   | `.github/workflows/deploy-on-ci-success.yml` lines 17–21                                 |
| **Server never synced**       | Production checkout was **many commits behind** `origin/main`; PM2 kept serving an **old Next.js build** (starter homepage, `/pricing` 404). | Server audit; public HTML vs current `apps/web`                                          |
| **Dirty tracked tree**        | Modified `package-lock.json` can block a non-forced `git checkout` of the CI SHA.                                                            | `scripts/deploy/git-sync.sh` (now uses `--force` only when `TAKIIA_ENFORCE_MAIN_ONLY=1`) |

Nginx routing to `127.0.0.1:3034` / `3033` was not the primary issue: **health endpoints worked** while the **web build was stale**.

## What actually deploys production

1. Enable **`TAKIIA_PRODUCTION_DEPLOY=true`** only after backup/migration prerequisites (manual approval).
2. Run **Deploy Production** on GitHub Actions (after CI green on `main` HEAD).
3. Workflow sets **`TAKIIA_DEPLOY_SHA`** to the CI-verified commit (`.github/workflows/deploy-production.yml` lines 107–135, 147).
4. SSH runs `git-sync.sh` → `remote-deploy.sh` under `/srv/apps/takiia` as user **`takiia`**.

## After this repository fix

- **`verify-deploy.sh`** fails the deploy if HEAD, health `commit`, `/pricing`, or marketing HTML do not match the expected SHA.
- **`remote-deploy.sh`** writes **`.deploy-metadata.json`** and exposes **`commit`** on `/health` and `/api/health`.
- **Concurrency** `takiia-production-deploy` prevents overlapping production deploys.

## Enabling automatic deploy later

Only after the **first successful manual deploy** and verified database migrations:

1. Set **`TAKIIA_AUTO_DEPLOY=true`** (with **`TAKIIA_PRODUCTION_DEPLOY=true`**).
2. Follow [auto-deploy.md](auto-deploy.md) to enable the `workflow_run` trigger on `deploy-production.yml` if desired, or rely on `deploy-on-ci-success.yml`.

Do **not** enable auto-deploy while pending migrations require a verified backup (`TAKIIA_CONFIRM_DB_BACKUP=yes`).
