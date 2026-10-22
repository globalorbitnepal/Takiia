# Deployment scripts

Run on the **production server** as user `takiia` under `/srv/apps/takiia`. PM2 operations touch **only** `takiia-api` and `takiia-web` (per-app `reload` or `start ecosystem.config.cjs --only <name>`). Never `pm2 reload all` or `pm2 save`.

Shell scripts are invoked as `bash scripts/deploy/<name>.sh` in CI and GitHub Actions. When staging new `*.sh` files, set the executable bit for Linux checkouts: `git add --chmod=+x scripts/deploy/<name>.sh`.

| Script                          | Purpose                                                                                                    |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `git-sync.sh`                   | Fetch approved `main` or detached commit SHA                                                               |
| `remote-deploy.sh`              | Build, conditional migrate, PM2 reload, health                                                             |
| `verify-health.sh`              | Localhost-only checks on ports 3033 / 3034                                                                 |
| `verify-deploy.sh`              | Fails if HEAD, health `commit`, `/pricing`, or legacy starter homepage markers do not match the deploy SHA |
| `ci-validate-deploy-scripts.sh` | CI: `bash -n` all deploy scripts + offline `verify-deploy` fixture tests                                   |
| `rehearse-migrations-test-db.sh` | `prisma migrate deploy` on a non-production DB via `git archive` (does not change app root checkout)      |
| `lib/load-env.sh`               | Source env files with permission checks (no logging)                                                       |

### Environment variables

| Variable                   | Purpose                                                                                |
| -------------------------- | -------------------------------------------------------------------------------------- |
| `TAKIIA_APP_ROOT`          | Default `/srv/apps/takiia`                                                             |
| `TAKIIA_DEPLOY_REF`        | `main` or 40-char commit SHA (validated)                                               |
| `TAKIIA_DEPLOY_SHA`        | When set, `git-sync.sh` checks out this SHA after `fetch origin main` (GitHub Actions) |
| `TAKIIA_ENFORCE_MAIN_ONLY` | `1` requires `TAKIIA_DEPLOY_SHA` and blocks non-`main` `TAKIIA_DEPLOY_REF`             |
| `TAKIIA_SKIP_GIT_SYNC`     | `1` when `git-sync.sh` already ran (GitHub Actions)                                    |
| `TAKIIA_CONFIRM_DB_BACKUP` | `yes` attests a human verified backup (does **not** create a backup)                   |
| `TAKIIA_DB_BACKUP_PATH`    | Non-empty dump under `/var/backups/takiia/`; must pass migrate-gate validation         |
| `TAKIIA_CONFIRM_EMPTY_DATABASE_BASELINE` | `yes` only with verified empty `takiia_db` + pre-migrate empty-catalog dump (see `docs/production-database-first-deploy.md`) |
| `TAKIIA_ECOSYSTEM_CONFIG`  | PM2 ecosystem file path                                                                |
| `TAKIIA_EXPECTED_SHA`      | Same as `TAKIIA_DEPLOY_SHA` for `verify-deploy.sh`                                     |

### Env file permissions

- `apps/api/.env` — mode **600**, owner `takiia`; never commit.
- `apps/web/.env.production` — public keys only (`NEXT_PUBLIC_*`); mode **600** recommended.

Required keys:

- `apps/web/.env.production`: `NEXT_PUBLIC_API_URL`
- `apps/api/.env`: `HOST`, `PORT`, `NODE_ENV` (and `DATABASE_URL` when using Postgres)

Values are never echoed by these scripts.
