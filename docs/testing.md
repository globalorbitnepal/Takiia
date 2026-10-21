# Testing

## Continuous integration

GitHub Actions workflow **CI** (`.github/workflows/ci.yml`) on `main` and pull requests:

| Step      | Command                                 |
| --------- | --------------------------------------- |
| Install   | `npm ci`                                |
| Typecheck | `npm run typecheck`                     |
| Format    | `npm run format:check`                  |
| Lint      | `npm run lint`                          |
| Build API | `npm run build --workspace @takiia/api` |
| Build Web | `npm run build --workspace @takiia/web` |

Web build uses `NEXT_PUBLIC_API_URL=https://api.takiia.com` in CI (public value only).

## Local (before push)

```bash
npm run typecheck
npm run format:check
npm run lint
npm run build --workspace @takiia/api
npm run build --workspace @takiia/web
```

## Health checks (manual)

| Target        | Command / URL                                |
| ------------- | -------------------------------------------- |
| API local     | `curl -fsS http://127.0.0.1:3033/health`     |
| Web local     | `curl -fsS http://127.0.0.1:3034/api/health` |
| Server script | `scripts/deploy/verify-health.sh`            |

## Not yet implemented

- Unit / integration test runner (`npm test` missing)
- Auth, messaging, or Socket.IO authorization tests
- Load or WebSocket-through-Cloudflare tests
- Production smoke tests (optional variable `TAKIIA_VERIFY_PUBLIC_HEALTH`)

## Pre-deploy verification checklist

- [ ] CI green on commit to deploy
- [ ] No secrets in `git diff`
- [ ] Migration SQL reviewed
- [ ] `takiia_db` backup completed
- [ ] Deploy workflow `deploy_ref` is `main` or an approved SHA
- [ ] `confirm_db_backup` = `yes` and `db_backup_path` set on server when migrations are pending
- [ ] Port 3033 still free
- [ ] Deploy workflow gate intentionally enabled (`TAKIIA_PRODUCTION_DEPLOY=true`)
- [ ] SSH host fingerprint secret set (recommended)
