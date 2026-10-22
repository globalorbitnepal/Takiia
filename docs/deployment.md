# Production deployment (preparation)

This document describes the **planned** production layout for [takiia.com](https://takiia.com). **Nothing in this file deploys automatically** until server bootstrap is complete, secrets are configured, and the repository variable `TAKIIA_PRODUCTION_DEPLOY` is set to `true`.

**Why pushes do not update the live site:** see [deployment-root-cause.md](deployment-root-cause.md).

## Production topology

| Component       | Process                         | Bind address     | Public URL                                     |
| --------------- | ------------------------------- | ---------------- | ---------------------------------------------- |
| API + Socket.IO | PM2 `takiia-api`                | `127.0.0.1:3033` | `https://api.takiia.com`                       |
| Next.js web     | PM2 `takiia-web`                | `127.0.0.1:3034` | `https://takiia.com`, `https://www.takiia.com` |
| PostgreSQL      | `postgresql` (existing service) | `127.0.0.1:5432` | Not public                                     |
| TLS / CDN       | Cloudflare → Nginx on origin    | 443 on origin    | Browser clients                                |

**Mobile (Expo):** `EXPO_PUBLIC_API_URL=https://api.takiia.com` (build-time public value only).

**Why two ports:** Port **3033** is reserved for the API (HTTP + WebSocket). Next.js runs on **3034** so Nginx can route hostnames without path conflicts. Existing sites on the VPS already use **3030–3032**; **3033** was verified free in a prior read-only audit (re-check before go-live).

Traffic flow:

```text
Browser / Mobile
    → Cloudflare (DNS proxy, WAF optional)
    → Nginx (TLS on origin, vhosts)
    → 127.0.0.1:3034 (web) or 127.0.0.1:3033 (API + /socket.io/)
```

Templates: `infra/nginx/takiia.conf.example`, `infra/pm2/ecosystem.config.example.cjs`.

## Server prerequisites (manual — not done by CI)

Complete on the **production Ubuntu server** only after explicit approval:

1. **Dedicated Linux user** `takiia` (no shared app runtime with `sysadmin` PM2 apps).
2. **App directory** `/srv/apps/takiia` owned by `takiia`.
3. **PostgreSQL** (as DB owner, separate session):
   - Database `takiia_db` (new, isolated).
   - Role `takiia_app` with least privilege on `takiia_db` only.
   - Do **not** alter existing databases (Ambition Holidays, Global Orbit Nepal, HostingBeyond, etc.).
4. **Read-only GitHub deploy key** on the server:
   - Generate key pair **on the server** as `takiia` (do not commit private key).
   - Add **public** key in GitHub → Repository → Settings → Deploy keys (read-only).
   - Clone: `git clone git@github.com:globalorbitnepal/Takiia.git /srv/apps/takiia`
5. **Environment file** `/srv/apps/takiia/apps/api/.env` (permissions `600`, owner `takiia`) with at least:
   - `NODE_ENV=production`
   - `HOST=127.0.0.1`
   - `PORT=3033`
   - `DATABASE_URL` (role `takiia_app`, database `takiia_db`)
   - `CORS_ORIGINS=https://takiia.com,https://www.takiia.com`
6. **Web build env** `/srv/apps/takiia/apps/web/.env.production` from `apps/web/.env.production.example`.
7. **PM2** as `takiia`: copy and adjust `infra/pm2/ecosystem.config.example.cjs` → `/srv/apps/takiia/ecosystem.config.cjs`; start **only** `takiia-api` and `takiia-web`.
8. **Nginx** new site file from `infra/nginx/takiia.conf.example` (new file under `sites-available`, symlink in `sites-enabled`) — **test** `nginx -t` before reload; schedule reload in a change window.
9. **TLS** on origin (e.g. Certbot) for `takiia.com`, `www.takiia.com`, `api.takiia.com`.
10. Re-verify **port 3033** is free: `ss -tlnH sport = :3033`.

## Cloudflare DNS (plan only — do not change until approved)

| Type | Name         | Content          | Proxy                  |
| ---- | ------------ | ---------------- | ---------------------- |
| A    | `takiia.com` | Origin server IP | Proxied (orange cloud) |
| A    | `www`        | Origin server IP | Proxied                |
| A    | `api`        | Origin server IP | Proxied                |

SSL/TLS mode on Cloudflare: **Full (strict)** once origin certificates exist.

Optional: redirect `www` → apex at Cloudflare or Nginx.

## GitHub Actions

| Workflow                                  | Purpose                        | When it runs                                                                 |
| ----------------------------------------- | ------------------------------ | ---------------------------------------------------------------------------- |
| `.github/workflows/ci.yml`                | typecheck, format, lint, build | Every push/PR to `main`                                                      |
| `.github/workflows/deploy-production.yml` | SSH deploy                     | `workflow_dispatch` only, **blocked** unless `TAKIIA_PRODUCTION_DEPLOY=true` |

### Repository variables (names only)

| Variable                      | Purpose                                                           |
| ----------------------------- | ----------------------------------------------------------------- |
| `TAKIIA_PRODUCTION_DEPLOY`    | Must be `true` to allow deploy workflow                           |
| `TAKIIA_VERIFY_PUBLIC_HEALTH` | Optional `true` to curl public URLs after deploy                  |
| `TAKIIA_AUTO_DEPLOY`          | **Not used until enabled** — see [auto-deploy.md](auto-deploy.md) |

### Repository secrets (names only — you supply values in GitHub UI)

| Secret                                   | Purpose                                                              |
| ---------------------------------------- | -------------------------------------------------------------------- |
| `TAKIIA_PRODUCTION_SSH_HOST`             | Origin hostname or IP (SSH target)                                   |
| `TAKIIA_PRODUCTION_SSH_USER`             | SSH user for deploy (e.g. `takiia`)                                  |
| `TAKIIA_PRODUCTION_SSH_PRIVATE_KEY`      | Private key for **SSH** to server (not the Git read-only deploy key) |
| `TAKIIA_PRODUCTION_SSH_HOST_FINGERPRINT` | **Required** SSH host key fingerprint (deploy fails if missing)      |

**SSH vs Git deploy key:** The **read-only deploy key** stays on the server for `git pull`. The **Actions SSH key** is a separate key pair: public half in `takiia` user `authorized_keys`, private half in `TAKIIA_PRODUCTION_SSH_PRIVATE_KEY`.

### GitHub Environment

Create environment **`production`** with required reviewers before enabling deploy.

## Deploy procedure (when enabled)

1. Merge to `main`; confirm CI green.
2. On server: backup database (see `docs/backup-and-restore.md`).
3. Merge to `main` and wait for **CI** workflow success on the latest `main` commit.
4. Run workflow **Deploy Production** with `confirm_db_backup` = `yes` only after a real backup exists, and `db_backup_path` under `/var/backups/takiia/` when migrations may apply.
5. Deploy syncs **`main` only** via `TAKIIA_DEPLOY_SHA` (CI-verified HEAD). SSH user must be **`takiia`**; app root **`/srv/apps/takiia`**.
6. `git-sync.sh` then `remote-deploy.sh`: **build before PM2**, conditional migrate (only when `prisma/migrations/*/migration.sql` exists and status reports pending), per-app PM2 **start or reload** for `takiia-api` / `takiia-web` only, `verify-health.sh`.
7. Optional public health if `TAKIIA_VERIFY_PUBLIC_HEALTH=true`.

**CI gate:** Deploy workflow requires GitHub Check Runs named **Validate workflow syntax** and **Build and quality checks** with `conclusion: success` on the exact `main` HEAD SHA — not unrelated combined status.

**First PM2 start:** Copy `infra/pm2/ecosystem.config.example.cjs` to `ecosystem.config.cjs` on the server before the first deploy, or let `remote-deploy.sh` run `pm2 start … --only <app>` when a process is missing.

**appleboy/ssh-action:** pass variables using step `env:` plus `envs:` (comma-separated names). See [upstream README](https://github.com/appleboy/ssh-action#pass-environment-variables-to-shell-script). Remote script is static; deploy inputs are passed only via `envs`, not interpolated into script text.

## Health checks

| Check         | Endpoint                                                         | Expect                    |
| ------------- | ---------------------------------------------------------------- | ------------------------- |
| API liveness  | `GET http://127.0.0.1:3033/health`                               | JSON `status: ok`         |
| API readiness | `GET http://127.0.0.1:3033/health/ready`                         | DB check when implemented |
| Web           | `GET http://127.0.0.1:3034/api/health`                           | JSON `status: ok`         |
| Public        | `https://api.takiia.com/health`, `https://takiia.com/api/health` | After DNS/TLS live        |

## Rollback

1. **Application:** On server, `cd /srv/apps/takiia && git checkout <previous-sha> && bash scripts/deploy/remote-deploy.sh` (skip migrate if schema unchanged) or `pm2 reload` previous build artifact if kept.
2. **Database:** Restore from pre-deploy dump only if migration was applied — see `docs/backup-and-restore.md`.
3. **Nginx:** Revert site file symlink; `nginx -t` then reload.
4. **Do not** restart unrelated PM2 apps (`ambition-holidays`, `globalorbitnepal`, etc.).

## Risks and unverified items

| Item                                   | Status                              |
| -------------------------------------- | ----------------------------------- |
| Port 3033 free on production           | **Re-verify before go-live**        |
| `takiia_db` / role creation            | **Not started** (requires approval) |
| Nginx / DNS / TLS for takiia.com       | **Not started**                     |
| Cloudflare configuration               | **Not started**                     |
| Full WebSocket test through Cloudflare | **Not verified**                    |
| PM2 log rotation / monitoring          | **Not configured**                  |

## Approval gate

Do **not** set `TAKIIA_PRODUCTION_DEPLOY=true` or run the deploy workflow until bootstrap checklist above is signed off.

**First deploy walkthrough:** [first-production-deploy.md](first-production-deploy.md).
