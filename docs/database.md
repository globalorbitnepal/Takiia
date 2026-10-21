# Database

## Technology

PostgreSQL with Prisma ORM in `apps/api`.

## Environments

| Environment | Database     | Host              | Notes                              |
| ----------- | ------------ | ----------------- | ---------------------------------- |
| Local dev   | `takiia_dev` | Developer machine | `apps/api/.env` (ignored)          |
| Production  | `takiia_db`  | VPS `127.0.0.1`   | Role `takiia_app`, least privilege |

Do **not** share databases with Ambition Holidays, Global Orbit Nepal, HostingBeyond, or other sites.

## Current schema status

- Prisma schema contains a **stub** model only (`HealthCheckStub`).
- **No** committed migrations yet.
- Domain schema (users, messages, etc.) is **not implemented**.

## Migration workflow (when schema exists)

### Local development

1. Set `DATABASE_URL` in `apps/api/.env` pointing at `takiia_dev`.
2. `npm run db:generate --workspace @takiia/api`
3. `npx prisma migrate dev --name <description>` from `apps/api` (creates SQL under `prisma/migrations/`).
4. Commit migration files to Git.

### Production (after approval)

1. Backup `takiia_db` (see `docs/backup-and-restore.md`).
2. Review migration SQL in the PR.
3. Deploy via gated workflow; `remote-deploy.sh` runs `npm run db:migrate:deploy --workspace @takiia/api`.
4. Verify `GET /health/ready` when DB checks are implemented.

**Never** run `prisma db push` against production. **Never** run migrations against non-`takiia_db` databases.

## Connection verification checklist

| Step               | Local dev         | Production               |
| ------------------ | ----------------- | ------------------------ |
| Schema defined     | Partial (stub)    | Same as Git              |
| Client generated   | `prisma generate` | On deploy build          |
| Server reachable   | Developer setup   | `127.0.0.1:5432` on VPS  |
| Database exists    | Manual create     | Manual create (approved) |
| Migrations applied | `migrate dev`     | `migrate deploy`         |
| App queries DB     | Not yet           | Not yet                  |

## `DATABASE_URL` format (placeholder)

```text
postgresql://takiia_app:PASSWORD@127.0.0.1:5432/takiia_db?schema=public
```

Store only in server-side `apps/api/.env`, never in web/mobile or Git.
