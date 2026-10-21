# Takiia rollback (documented — not automated or tested)

## Scope

Rollback affects **only** `/srv/apps/takiia`, PM2 processes **`takiia-api`** and **`takiia-web`**, and database **`takiia_db`**. It must **not** touch Ambition Holidays, Global Orbit Nepal, HostingBeyond, or their databases.

## Application rollback (documented)

1. On the server as `takiia`, `cd /srv/apps/takiia`.
2. `git fetch origin main` and `git checkout <previous-known-good-sha>` (manual emergency only; GitHub Actions deploy path uses `main` only).
3. `npm ci` and rebuild (`scripts/deploy/remote-deploy.sh` skips migrate when none pending).
4. `pm2 reload takiia-api --update-env` and `pm2 reload takiia-web --update-env` only.
5. Run `scripts/deploy/verify-health.sh`.

**Limited local support:** Before `git-sync.sh` changes the tree, if `takiia-api` is already registered in PM2, the current `git rev-parse HEAD` is written to `/srv/apps/takiia/.deploy-last-known-good`. After a successful deploy, that file is updated again. This is **not** automatic rollback — operators must manually `git checkout` that SHA, rebuild, and PM2 reload Takiia apps only.

**Not implemented in repo:** automated release directories, blue/green ports, or workflow-driven rollback.

## Database rollback (documented)

- If a migration ran, restore `takiia_db` from the **pre-deploy dump** referenced by `TAKIIA_DB_BACKUP_PATH`.
- Restore procedure: see `docs/backup-and-restore.md`.
- **Restore test:** **NOT VERIFIED** in this project.

## Nginx / DNS rollback

- Remove or disable the Takiia site symlink; `nginx -t`; reload during a window.
- Revert Cloudflare DNS if changed.

## Status

| Capability                  | Status              |
| --------------------------- | ------------------- |
| Documented steps            | Yes                 |
| Tested rollback             | **NOT VERIFIED**    |
| Automated rollback workflow | **NOT IMPLEMENTED** |
