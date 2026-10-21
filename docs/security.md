# Security

## Public repository

`globalorbitnepal/Takiia` is **public**. Never commit:

- `.env`, `.env.local`, `.env.production` (real files)
- Private keys, certificates with private keys, tokens, database URLs with real passwords
- Database dumps or user uploads

Only commit `*.example` templates with placeholders.

## Secret locations

| Location                                     | Allowed content                                        |
| -------------------------------------------- | ------------------------------------------------------ |
| `apps/api/.env` (server, ignored)            | `DATABASE_URL`, `HOST`, `PORT`, future signing secrets |
| `apps/web/.env.production` (server, ignored) | `NEXT_PUBLIC_*` only                                   |
| `apps/mobile/.env` / EAS secrets             | `EXPO_PUBLIC_*` only                                   |
| GitHub Actions secrets                       | SSH deploy credentials (names in `docs/deployment.md`) |
| Server `takiia` home                         | Git read-only deploy key **private** half              |

## Network exposure

- API binds to **`127.0.0.1:3033`** in production (not `0.0.0.0`).
- PostgreSQL remains **localhost-only** on the VPS.
- Public access only via Nginx + TLS at Cloudflare.

## Application (current and planned)

- **CORS:** `CORS_ORIGINS` allowlist (include `https://takiia.com`, `https://www.takiia.com` in production).
- **Socket.IO:** Must require authentication before private channels (not implemented yet).
- **Auth:** Passwords hashed with industry-standard algorithms when implemented; no plaintext refresh tokens.
- **Uploads:** Validated type/size; no public permanent URLs for private attachments (planned).
- **Rate limiting:** Required on auth and messaging endpoints (planned).
- **Headers:** Nginx + framework hardening when web features expand.

## Deployment keys

- **Git deploy key:** read-only, per-server, never in GitHub Actions logs.
- **SSH deploy key for Actions:** dedicated key, `authorized_keys` entry for `takiia` only, rotate on compromise.
- **SSH host fingerprint:** `TAKIIA_PRODUCTION_SSH_HOST_FINGERPRINT` is mandatory in the deploy workflow before any connection.
- **Deploy ref:** only `main` or a validated 40-character commit SHA; passed via environment variables, not shell interpolation from untrusted input.

## Logging

Do not log passwords, tokens, full `DATABASE_URL`, or message bodies in production logs.

## Pre-push / CI

- `.gitignore` excludes env files, keys, `node_modules`, build output.
- CI runs on GitHub-hosted runners; no production secrets in `ci.yml`.

## Incident response (outline)

1. Revoke compromised keys (GitHub deploy key, SSH key, DB password).
2. Rotate `DATABASE_URL` password for `takiia_app` only.
3. Review Git history and server access logs.
4. Restore from backup if data integrity is uncertain.
