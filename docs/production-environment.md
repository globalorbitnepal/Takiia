# Production environment (names and values — set on server only)

Never commit real secrets. Create files manually on the server; do not overwrite existing files.

## `apps/api/.env` (mode `600`, owner `takiia`)

| Variable                                                         | Purpose                                                            |
| ---------------------------------------------------------------- | ------------------------------------------------------------------ |
| `NODE_ENV`                                                       | `production`                                                       |
| `HOST`                                                           | `127.0.0.1`                                                        |
| `PORT`                                                           | `3033`                                                             |
| `DATABASE_URL`                                                   | PostgreSQL URL for role `takiia_app` and database `takiia_db` only |
| `SESSION_SECRET`                                                 | Long random string (≥ 32 chars)                                    |
| `COOKIE_DOMAIN`                                                  | `.takiia.com` (for cross-subdomain cookies with API)               |
| `CORS_ORIGINS`                                                   | `https://takiia.com,https://www.takiia.com`                        |
| `PUBLIC_WEB_URL`                                                 | `https://takiia.com`                                               |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` | Outbound email for verification and password reset                 |
| `STUN_URLS`                                                      | STUN servers (comma-separated)                                     |
| `TURN_URLS`, `TURN_USERNAME`, `TURN_CREDENTIAL`                  | TURN for production WebRTC (required for many networks)            |
| `UPLOAD_DIR`                                                     | e.g. `/srv/apps/takiia/uploads` (not in git)                       |

## `apps/web/.env.production`

| Variable              | Purpose                  |
| --------------------- | ------------------------ |
| `NEXT_PUBLIC_API_URL` | `https://api.takiia.com` |

## First migration

1. Backup `takiia_db` to `/var/backups/takiia/` (verify file size and `pg_restore --list` or `head` on custom format).
2. Run **Deploy Production** manually with workflow input `confirm_db_backup=yes` and `db_backup_path` pointing at that backup when pending migrations exist.
3. On the server, confirm `curl -fsS http://127.0.0.1:3033/health/ready` shows `database: ok` and PM2 processes are online for API and web only.
4. Do **not** drop or reset `takiia_db`. Migrations apply forward only via `prisma migrate deploy`.

## SSH and GitHub Actions

- Store the production host **SSH host key fingerprint** in `TAKIIA_PRODUCTION_SSH_HOST_FINGERPRINT` (verify with `ssh-keyscan` before first deploy).
- Deploy user must be `takiia` only (`TAKIIA_PRODUCTION_SSH_USER`).
- `appleboy/ssh-action` uses the fingerprint secret; never disable host key verification.
- Repository **secrets** (names only): `TAKIIA_PRODUCTION_SSH_HOST`, `TAKIIA_PRODUCTION_SSH_USER`, `TAKIIA_PRODUCTION_SSH_PRIVATE_KEY`, `TAKIIA_PRODUCTION_SSH_HOST_FINGERPRINT`.
- Optional variable: `TAKIIA_VERIFY_PUBLIC_HEALTH` for post-deploy public URL checks after DNS cutover.

## Automatic deployment gates

Leave both **unset or false** until the first manual production deploy succeeds and localhost health, migrations, and the website are verified:

- `TAKIIA_PRODUCTION_DEPLOY`
- `TAKIIA_AUTO_DEPLOY`

Auto deploy uses `TAKIIA_CONFIRM_DB_BACKUP=no` and is unsuitable for the **first** migration without a verified backup. Enable auto deploy only after manual cutover.
