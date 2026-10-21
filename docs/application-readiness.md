# Application readiness (source-based assessment)

**Takiia is not a functioning chat product.** The repository is a monorepo scaffold with health checks and Socket.IO placeholders. There are **no automated tests** in the tree (`describe` / `test(` not found).

## Implemented (in source)

| Area               | Status      | Notes                                                                     |
| ------------------ | ----------- | ------------------------------------------------------------------------- |
| API HTTP server    | Yes         | Express on `HOST`/`PORT` (`apps/api/src/config/env.ts`)                   |
| Health routes      | Yes         | JSON health payloads via `@takiia/shared`                                 |
| Socket.IO          | Partial     | Server listens; emits `takiia:ready` on connect — no auth, rooms, or chat |
| Prisma client stub | Schema only | `HealthCheckStub` model; **no migration SQL**                             |
| Web app            | Starter     | Next.js home + `/api/health` proxy route                                  |
| Mobile app         | Starter     | Expo screen with API health fetch button                                  |
| Shared package     | Yes         | Zod health helpers                                                        |

## Feature matrix (verified in source — not tested in CI)

| Feature                                  | Implemented         | Tested             |
| ---------------------------------------- | ------------------- | ------------------ |
| Registration and login                   | No                  | No                 |
| Secure authentication / sessions         | No                  | No                 |
| User profiles                            | No                  | No                 |
| One-to-one messaging                     | No                  | No                 |
| Group messaging                          | No                  | No                 |
| Persistent message storage               | No                  | No                 |
| Authenticated Socket.IO messaging        | No                  | No                 |
| File uploads                             | No                  | No                 |
| Voice and video calls                    | No                  | No                 |
| Push notifications                       | No                  | No                 |
| Rate limiting / app security controls    | No                  | No                 |
| Health HTTP API                          | Yes                 | No automated tests |
| Socket.IO connect + `takiia:ready` event | Partial (demo only) | No                 |

The web home page states chat and authentication are **not enabled yet**. Deploying to production exposes a **shell + health endpoints**, not a finished messaging service.

## Not implemented (summary)

- Everything in the matrix marked **No**, plus production hardening (rate limits, WAF in app), and meaningful integration or E2E tests.

## Configuration semantics

| Setting               | Production intent                                                                              | Risk if wrong                               |
| --------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `HOST=127.0.0.1`      | API not directly on public interface                                                           | Binding `0.0.0.0` exposes API without Nginx |
| `PORT=3033`           | Matches Nginx upstream                                                                         | Port conflict with other apps               |
| `CORS_ORIGINS`        | Must list `https://takiia.com` and `https://www.takiia.com` before browser clients use the API | Default is localhost-only                   |
| `NEXT_PUBLIC_API_URL` | `https://api.takiia.com` at web build time                                                     | Wrong URL breaks client calls               |
| Socket.IO CORS        | Same as `CORS_ORIGINS`                                                                         | Blocks or over-permits browser connections  |

Health endpoints report process readiness only — **not** database connectivity, auth, or chat features.

## Minimum steps before exposing the API publicly

1. Complete server bootstrap (`docs/deployment.md`) with API bound to **127.0.0.1:3033** only.
2. Set production `CORS_ORIGINS` and rebuild web with correct `NEXT_PUBLIC_API_URL`.
3. Install **Takiia-only** Nginx vhosts (`infra/nginx/takiia.conf.example`) and TLS; use Cloudflare **Full (strict)** only with valid origin certificates.
4. Confirm localhost health via `scripts/deploy/verify-health.sh` before DNS cutover (`docs/domain-cutover.md`).
5. Treat public exposure as **infrastructure go-live** for a health/demo scaffold — not a chat launch.

## Verification status

| Item                | Local / docs             | Production                    |
| ------------------- | ------------------------ | ----------------------------- |
| Build & lint        | CI workflow (after push) | Not verified                  |
| Deploy scripts      | `bash -n`, design review | Not verified                  |
| Public API security | Documented               | **Blocked** until above steps |
