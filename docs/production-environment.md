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

1. Backup `takiia_db` to `/var/backups/takiia/`.
2. Deploy with `confirm_db_backup=yes` and `db_backup_path` set when the workflow detects pending migrations.
3. Verify `/health/ready` reports `database: ok` on localhost before public cutover.

## Automatic deployment gates

Both must be `true` after first successful manual deploy:

- `TAKIIA_PRODUCTION_DEPLOY`
- `TAKIIA_AUTO_DEPLOY`

GitHub Secrets (names only): `TAKIIA_PRODUCTION_SSH_HOST`, `TAKIIA_PRODUCTION_SSH_USER`, `TAKIIA_PRODUCTION_SSH_PRIVATE_KEY`, `TAKIIA_PRODUCTION_SSH_HOST_FINGERPRINT`.
