# Production database — first deploy and migrations

**Status:** Planning only. Do not run migrations or enable deploy until steps below are completed and approved.

## Current facts

- Repository contains **two** Prisma migration directories under `apps/api/prisma/migrations/`.
- Production `takiia_db` was reported **without application tables**; an existing **892-byte** `pg_dump` archive had **no table TOC entries** and is **not** a verified recovery backup.
- `remote-deploy.sh` applies migrations only when `prisma migrate status` reports pending changes, and only if:
  - `TAKIIA_CONFIRM_DB_BACKUP=yes`, and
  - `TAKIIA_DB_BACKUP_PATH` points to a file under `/var/backups/takiia/` that passes **`validate-db-backup`** (custom `PGDMP` dump with restorable `pg_restore --list` TOC entries, or plain SQL with `CREATE TABLE` / schema markers).
- **First deploy on an empty `takiia_db`:** a pre-migrate `pg_dump` is often an **empty catalog** (valid custom archive, no `TABLE` TOC lines). That file **does not** prove application-data recovery. It is accepted **only** when a read-only check shows **zero public tables** and **no** `_prisma_migrations`, and the operator sets **`TAKIIA_CONFIRM_EMPTY_DATABASE_BASELINE=yes`** (Deploy Production input `confirm_empty_database_baseline`). After the first successful `migrate deploy`, take a **new** dump that lists real tables for future deploys.

See `scripts/deploy/remote-deploy.sh` (migration block) and `scripts/deploy/lib/migrate.sh`.

## Required backup procedure (before first `migrate deploy`)

Run on the server as user **`takiia`** (or DBA with least privilege on **`takiia_db` only**):

1. Create directory `/var/backups/takiia/` if missing (`takiia` writable).
2. Create a new dump, e.g.  
   `pg_dump -Fc -f /var/backups/takiia/takiia_db_backup_YYYYMMDD_HHMMSS.dump takiia_db`  
   (use credentials from `apps/api/.env` locally on the server — **never** commit or paste `DATABASE_URL` in chat).
3. Verify the file is **non-empty** (expect **much larger than 892 bytes** once schema exists).
4. Verify contents:  
   `pg_restore --list /var/backups/takiia/takiia_db_backup_....dump`  
   must list **tables** after migrations, or at minimum confirm the dump is restorable in a **non-production** test database.
5. Record the absolute path for the Deploy Production workflow input **`db_backup_path`**.

## First controlled deploy (manual)

1. CI green on target `main` commit.
2. **`TAKIIA_PRODUCTION_DEPLOY=true`** (explicit approval).
3. Run **Deploy Production** with:
   - `confirm_db_backup=yes`
   - `db_backup_path=/var/backups/takiia/<verified-file>`
   - `confirm_empty_database_baseline=yes` **only** if `takiia_db` is still empty (no public tables, no `_prisma_migrations`) and the backup path is the pre-migrate empty-catalog dump
4. Confirm `scripts/deploy/verify-deploy.sh` passes (commit + `/pricing` + marketing homepage).
5. Confirm `https://api.takiia.com/health/ready` shows `database: ok` when applicable.

## Baseline / drift

Do **not** run `prisma migrate resolve` or baseline commands unless the **actual** live schema has been inspected and a written runbook approved. If the database is empty, **`prisma migrate deploy`** on first deploy is the expected forward path once backup gates pass.

## Rollback

See [rollback.md](rollback.md). Use `.deploy-last-known-good` and verified backups only.
