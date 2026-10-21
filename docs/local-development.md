# Local development

## Prerequisites

- Node.js 20+
- npm 10+
- For mobile Android: Android Studio / emulator or device with Expo Go
- PostgreSQL (optional until you run Prisma migrations; `prisma generate` needs `DATABASE_URL` set)

## Install

From the repository root:

```bash
npm install
npm run build --workspace @takiia/shared
```

## Environment files

Copy examples (never commit real `.env` files):

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
cp apps/mobile/.env.example apps/mobile/.env
```

Edit `apps/api/.env` with a local `DATABASE_URL` when you are ready. For client generation only, a placeholder URL is enough:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/takiia_dev?schema=public"
```

Then:

```bash
npm run db:generate --workspace @takiia/api
```

Do **not** run `prisma migrate` against production until that is explicitly planned.

## Run applications

**API** (terminal 1):

```bash
npm run dev:api
```

**Web** (terminal 2):

```bash
npm run dev:web
```

**Both API + web**:

```bash
npm run dev
```

**Mobile**:

```bash
npm run dev:mobile
```

Use the Expo CLI to open Android. On a physical device, set `EXPO_PUBLIC_API_URL` to your machine's LAN IP (not `localhost`).

## Verify health

- API: http://localhost:4000/health
- Web: http://localhost:3000/api/health
- Mobile: tap **Check API health** on the home screen

## Quality checks

```bash
npm run typecheck
npm run lint
npm run format:check
```
