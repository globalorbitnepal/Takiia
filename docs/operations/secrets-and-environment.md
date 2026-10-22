# Secrets and environment

Never commit production secrets. Never paste secret values into issues, PRs, or chat.

## API (`apps/api/.env` on server)

| Variable                          | Purpose                               |
| --------------------------------- | ------------------------------------- |
| `NODE_ENV`                        | `production`                          |
| `HOST` / `PORT`                   | `127.0.0.1` / `3033`                  |
| `DATABASE_URL`                    | PostgreSQL `takiia_app` → `takiia_db` |
| `CORS_ORIGINS`                    | Public web origins                    |
| Session/auth, email, storage keys | Per `docs/production-environment.md`  |

Recovery: authorized password manager or encrypted offline backup maintained by operators.

File mode: `600`, owner `takiia`.

## Web (`apps/web/.env.production`)

| Variable              | Purpose                     |
| --------------------- | --------------------------- |
| `NEXT_PUBLIC_API_URL` | Public API URL (not secret) |

## GitHub Actions (deployment)

Inspect: Repository → **Settings** → **Secrets and variables** → **Actions**

- Secrets: `TAKIIA_PRODUCTION_SSH_*` (see [production-deployment.md](production-deployment.md))
- Variables: `TAKIIA_PRODUCTION_DEPLOY`, `TAKIIA_AUTO_DEPLOY` (keep auto deploy disabled unless explicitly approved)

## Development desktop

Use a separate local database and credentials. Do not copy production `DATABASE_URL` to `C:\Users\User\Desktop\Takiia`.
