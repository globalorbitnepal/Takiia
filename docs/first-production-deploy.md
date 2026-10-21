# First production deployment checklist

Use this after local CI checks pass and you **explicitly approve** commit and push. Nothing here runs automatically from the repository.

## A. Local (Windows)

1. Review uncommitted changes (`git status`, `git diff`).
2. **Approve** commit and push to `main` on `globalorbitnepal/Takiia`.
3. On GitHub → **Actions**, confirm workflow **CI** runs and passes on the new `main` commit (jobs **Validate workflow syntax** and **Build and quality checks**).

## B. GitHub configuration (names only — set values in the UI)

### Repository variable

| Name                       | Value for first deploy                                       |
| -------------------------- | ------------------------------------------------------------ |
| `TAKIIA_PRODUCTION_DEPLOY` | Leave **unset** or not `true` until server bootstrap is done |

### After bootstrap (manual deploy only)

| Name                       | Value                                        |
| -------------------------- | -------------------------------------------- |
| `TAKIIA_PRODUCTION_DEPLOY` | `true` (disable immediately if deploy fails) |

### Optional

| Name                          | Purpose                                 |
| ----------------------------- | --------------------------------------- |
| `TAKIIA_VERIFY_PUBLIC_HEALTH` | `true` only after Nginx/TLS/DNS cutover |

### Secrets (production SSH — **not** the server Git deploy key)

| Secret                                   |
| ---------------------------------------- |
| `TAKIIA_PRODUCTION_SSH_HOST`             |
| `TAKIIA_PRODUCTION_SSH_USER` (`takiia`)  |
| `TAKIIA_PRODUCTION_SSH_PRIVATE_KEY`      |
| `TAKIIA_PRODUCTION_SSH_HOST_FINGERPRINT` |

### Environment

- Create GitHub environment **`production`** with required reviewers (recommended).

## C. One-time server bootstrap (as `takiia` / DBA — separate approvals)

Do **not** modify Ambition Holidays, Global Orbit Nepal, HostingBeyond, or their Nginx/PM2/DB.

1. **User & directory:** Linux user `takiia`, app root `/srv/apps/takiia` owned by `takiia`.
2. **PostgreSQL:** database `takiia_db`, role `takiia_app` with access **only** to `takiia_db`.
3. **Git:** read-only deploy key on server → GitHub deploy keys; clone or update repo at `/srv/apps/takiia`.
4. **Env files (create manually — never commit; do not overwrite if they already exist):**
   - `/srv/apps/takiia/apps/api/.env` — `chmod 600`, `HOST=127.0.0.1`, `PORT=3033`, `NODE_ENV=production`, `DATABASE_URL` → `takiia_db`, `CORS_ORIGINS` for production web origins when needed.
   - `/srv/apps/takiia/apps/web/.env.production` — `NEXT_PUBLIC_API_URL=https://api.takiia.com` (from `apps/web/.env.production.example`).
5. **PM2:** copy `infra/pm2/ecosystem.config.example.cjs` → `/srv/apps/takiia/ecosystem.config.cjs` (adjust paths if needed). Defines **only** `takiia-api` and `takiia-web`.
6. **Port check:** confirm `127.0.0.1:3033` and `:3034` are free (`ss -tlnH`).
7. **Backups directory:** `/var/backups/takiia/` for future dumps (not required for first deploy while **no** Prisma migrations exist).

## D. First application deploy (localhost only)

1. Set `TAKIIA_PRODUCTION_DEPLOY=true` when bootstrap is complete.
2. Run **Deploy Production** (`workflow_dispatch`) with `confirm_db_backup` = **`no`** (no migration SQL in repo today).
3. Workflow checks CI on `main` HEAD, SSHs as `takiia`, runs `git-sync.sh` + `remote-deploy.sh`.
4. On server, confirm: `bash /srv/apps/takiia/scripts/deploy/verify-health.sh` (127.0.0.1:3033 and :3034 only).

**First PM2 start:** if processes did not exist, `remote-deploy.sh` starts them via `pm2 start ecosystem.config.cjs --only <name>`. No `pm2 reload all` / `pm2 save`.

## E. Domain / HTTPS (separate approval — not part of first app deploy)

Until a **Takiia-only** Nginx vhost and certificates exist, **takiia.com may still show Ambition Holidays** (default SSL vhost). See [domain-cutover.md](domain-cutover.md).

1. Add new site file from `infra/nginx/takiia.conf.example` (do not edit other sites).
2. `nginx -t` before any reload; reload only in an approved window.
3. Origin TLS + Cloudflare **Full (strict)**.
4. Public checks: `https://api.takiia.com/health`, `https://takiia.com/api/health`.

## F. What this deploy is **not**

- Not a launched chat product — see [application-readiness.md](application-readiness.md).
- Not verified rollback — see [rollback.md](rollback.md).
- Not automatic deploy until you follow [auto-deploy.md](auto-deploy.md) after a **verified** first deploy.
