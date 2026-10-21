# Takiia architecture

## Monorepo layout

| Path                | Role                                    |
| ------------------- | --------------------------------------- |
| `apps/web`          | Next.js App Router (web client)         |
| `apps/mobile`       | Expo + expo-router (Android-focused)    |
| `apps/api`          | Express HTTP API + Socket.IO            |
| `packages/shared`   | Zod schemas and shared TypeScript types |
| `infra/*`           | Nginx, PM2, LiveKit, Coturn templates   |
| `scripts/deploy`    | Server-side deploy and health scripts   |
| `.github/workflows` | CI and gated production deploy          |

## Runtime boundaries

- **Secrets** live only in server-side `apps/api/.env` (and future server config).
- **Web** and **mobile** use public env vars only (`NEXT_PUBLIC_*`, `EXPO_PUBLIC_*`).
- **Real-time:** Socket.IO on the API process; authenticate before private channels (planned).
- **Calling:** LiveKit + Coturn under `infra/` (planned, not deployed).
- **Data:** PostgreSQL via Prisma (`takiia_dev` local, `takiia_db` production when created).

## Production topology (planned)

```text
                    Cloudflare DNS + proxy
                              |
                    Nginx (TLS on origin)
                    /                    \
        takiia.com / www          api.takiia.com
                    |                    |
            127.0.0.1:3034          127.0.0.1:3033
            (Next.js / PM2)         (API + Socket.IO / PM2)
                                         |
                                  127.0.0.1:5432
                                  PostgreSQL takiia_db
```

See `docs/deployment.md` for bootstrap, DNS, and CI/CD.

## Health checks

| Surface       | Endpoint                                        |
| ------------- | ----------------------------------------------- |
| API liveness  | `GET /health`                                   |
| API readiness | `GET /health/ready` (DB check when implemented) |
| Web           | `GET /api/health`                               |
| Mobile        | Configured `EXPO_PUBLIC_API_URL` + `/health`    |

## Local ports (defaults)

| App             | Port                |
| --------------- | ------------------- |
| Web (dev)       | 3000                |
| API (dev)       | 4000                |
| API (prod plan) | 3033 on `127.0.0.1` |
| Web (prod plan) | 3034 on `127.0.0.1` |
| Expo Metro      | 8081                |
