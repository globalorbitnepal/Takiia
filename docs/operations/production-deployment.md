# Production deployment (Takiia)

Operational runbook for **globalorbitnepal/Takiia** on server `51.15.21.166`, app root `/srv/apps/takiia`, user `takiia`.

See also [deployment.md](../deployment.md), [first-production-deploy.md](../first-production-deploy.md), and [deployment-root-cause.md](../deployment-root-cause.md).

## Release gates (do not bypass)

1. Fix merged to `main` and CI green on that commit.
2. Repository variable `TAKIIA_PRODUCTION_DEPLOY` = `true` only when an authorized release is intended.
3. GitHub Actions workflow **Deploy Production** run with:
   - `ref` = approved `main` SHA (not a feature branch).
   - `confirm_db_backup` only when pending migrations exist (attestation; does not create a dump).
4. Secrets present (names only — values in GitHub Settings → Secrets and variables → Actions):
   - `TAKIIA_PRODUCTION_SSH_HOST`
   - `TAKIIA_PRODUCTION_SSH_USER` (`takiia`)
   - `TAKIIA_PRODUCTION_SSH_PRIVATE_KEY`
   - `TAKIIA_PRODUCTION_SSH_HOST_FINGERPRINT` — must match server host key `SHA256:OcDdcR3jir76uLahlZtQfMcI+VOwgkiV2KdtT0P2U+s` (not the deploy client key fingerprint).

## Server-side sequence (`scripts/deploy/remote-deploy.sh`)

1. `git sync` (unless `TAKIIA_SKIP_GIT_SYNC=1`)
2. `npm ci`
3. Load `apps/api/.env` (strict permissions)
4. `npm run db:generate --workspace @takiia/api`
5. If `DATABASE_URL` set: validate `takiia_db`, check pending migrations, require backup path + gates before `db:migrate:deploy`
6. Build `@takiia/shared`, `@takiia/api`, `@takiia/web`
7. Write `.deploy-metadata.json` via `takiia_write_deploy_metadata`
8. PM2 reload **only** `takiia-api` and `takiia-web`
9. `verify-health.sh` and optional `verify-deploy.sh` when `TAKIIA_EXPECTED_SHA` is set

Never run `pm2 reload all` on the shared VPS.

## Manual deploy (break-glass, authorized only)

```bash
sudo -u takiia -H bash -lc 'cd /srv/apps/takiia && TAKIIA_SKIP_GIT_SYNC=1 bash scripts/deploy/remote-deploy.sh'
```

Set migration env vars only when pending migrations exist (see [database-backups.md](database-backups.md)).

## Post-deploy verification

- `https://takiia.com/pricing` → HTTP 200, marketing site (not starter placeholder).
- `https://api.takiia.com/health` (or local `127.0.0.1:3033/health`) — process up, DB reachable; commit SHA when metadata file exists.
- On server: `git -C /srv/apps/takiia rev-parse HEAD` matches deployed SHA.
- `test -f /srv/apps/takiia/.deploy-metadata.json` — if missing, health may omit `commit` until next successful metadata write.

## Runbook A — development machine lost

1. Clone `https://github.com/globalorbitnepal/Takiia.git`
2. Install Node.js version from root `package.json` `engines`
3. Restore **development-only** env from secure vault (never production `DATABASE_URL` on desktop)
4. `npm ci` → `npm run db:generate --workspace @takiia/api`
5. Local PostgreSQL database separate from `takiia_db`
6. `npm run typecheck`, `npm test`, `npm run build`
7. Feature branch → PR → merge after CI
