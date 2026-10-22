# Database backups (`takiia_db`)

## Verified tooling in repository

- **Create backup:** `scripts/backup/takiia-db-backup.sh` (run as user `takiia` on server)
- **Dry-run:** `scripts/backup/takiia-db-backup.sh --dry-run`
- **Restore test (isolated DB only):** `scripts/backup/takiia-restore-test.sh` — see [disaster-recovery.md](disaster-recovery.md)

Legacy narrative: [backup-and-restore.md](../backup-and-restore.md).

## Backup script behavior

1. Loads `apps/api/.env` without logging secrets
2. Refuses unless `DATABASE_URL` targets database name **`takiia_db`**
3. Writes `takiia_db_backup_YYYYMMDD_HHMMSS.dump` under `/var/backups/takiia` (no overwrite)
4. Validates `pg_restore --list` and minimum `TABLE DATA` count (default ≥ 1)
5. Writes `.sha256` sidecar, `chmod 600` on dump and checksum
6. Appends one line to `backup.log` (no credentials)

## Migration gate interaction

When Prisma reports **pending** migrations, `remote-deploy.sh` requires:

- `TAKIIA_CONFIRM_DB_BACKUP=yes`
- `TAKIIA_DB_BACKUP_PATH` pointing to a **existing** non-empty file under `/var/backups/takiia/`
- `takiia_validate_db_backup_for_migrate_gate` success

Creating a fresh dump immediately before migrate:

```bash
sudo -u takiia -H bash /srv/apps/takiia/scripts/backup/takiia-db-backup.sh
```

Then export `TAKIIA_DB_BACKUP_PATH` to that file for the deploy run.

## Retention (not automated in this task)

Proposed policy for **new verified** dumps: 14 days, filename pattern `takiia_db_backup_*.dump` only. Do not delete historical zero-byte or small pre-migration artifacts without explicit approval.

## Daily automation (prepared, not installed)

Example cron (install only after approval): see `scripts/backup/install-daily-backup.cron.example`.

Alert if no verified backup within 26 hours (monitoring not configured in repo).

## Known production evidence (re-verify on server)

| Artifact                                | Status                                                           |
| --------------------------------------- | ---------------------------------------------------------------- |
| `takiia_db_backup_20261023_001716.dump` | SHA256 verified on server (`fd47d608…`); 33 `TABLE DATA` entries |
| Automated daily cron                    | **NOT INSTALLED**                                                |
| Off-site copy                           | **NOT VERIFIED** — see [off-site-backup.md](off-site-backup.md)  |
