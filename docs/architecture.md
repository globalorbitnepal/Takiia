# Takiia architecture (initial)

## Monorepo layout

| Path              | Role                                    |
| ----------------- | --------------------------------------- |
| `apps/web`        | Next.js marketing / web client          |
| `apps/mobile`     | Expo (Android-focused) mobile client    |
| `apps/api`        | Node.js HTTP API + Socket.IO            |
| `packages/shared` | Zod schemas and shared TypeScript types |
| `infra/*`         | Future nginx, LiveKit, Coturn configs   |

## Runtime boundaries

- **Secrets** (database URLs, API keys) exist only in `apps/api` server environment.
- **Web** and **mobile** receive public configuration only (`NEXT_PUBLIC_*`, `EXPO_PUBLIC_*`).
- **Real-time**: Socket.IO on the API process (handlers are placeholders).
- **Calling**: WebRTC with self-hosted LiveKit + Coturn planned under `infra/` (not wired yet).
- **Data**: PostgreSQL via Prisma in `apps/api` (schema stub only; no migrations run in scaffold).

## Health checks

| Surface | Endpoint                                    |
| ------- | ------------------------------------------- |
| API     | `GET /health`, `GET /health/ready`          |
| Web     | `GET /api/health`                           |
| Mobile  | Home screen button → `GET {API_URL}/health` |

## Local ports (defaults)

- Web: `3000`
- API: `4000`
- Expo dev server: `8081` (Metro)
