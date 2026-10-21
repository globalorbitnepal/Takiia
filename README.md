# Takiia

Messaging and voice/video calling platform — monorepo scaffold.

## Stack

- **Web**: Next.js (TypeScript)
- **Mobile**: React Native + Expo (TypeScript, Android target)
- **API**: Node.js + Express + Socket.IO (TypeScript)
- **Database**: PostgreSQL + Prisma (configured, not migrated)
- **Shared**: `@takiia/shared` (Zod + types)

Authentication, messaging, calling, payments, and admin features are **not** implemented yet.

## Repository layout

```
apps/web          Next.js site
apps/mobile       Expo Android app
apps/api          HTTP + Socket.IO backend
packages/shared   Shared validation and types
infra/nginx       Future reverse proxy
infra/livekit     Future WebRTC media server
infra/coturn      Future TURN server
docs/             Architecture and setup guides
```

## Quick start

1. `npm install`
2. `npm run build --workspace @takiia/shared`
3. Copy `.env.example` files under `apps/api`, `apps/web`, and `apps/mobile` (see [docs/local-development.md](docs/local-development.md))
4. `npm run dev:api` and `npm run dev:web` (or `npm run dev` for both)

## GitHub

Create a **private** repository named `takiia` on GitHub, then:

```bash
git init
git add .
git commit -m "chore: initial monorepo scaffold"
git remote add origin git@github.com:YOUR_ORG/takiia.git
git push -u origin main
```

## Security

- Never commit `.env` files or secrets.
- Do not put database URLs or private keys in web or mobile bundles.
- Production VPS, nginx, LiveKit, and Coturn are out of scope for this scaffold.

See [docs/architecture.md](docs/architecture.md) and [docs/local-development.md](docs/local-development.md) for details.
