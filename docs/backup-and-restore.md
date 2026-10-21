# Backup and restore

## Scope

Applies to **`takiia_db`** only. Do not backup or restore other production databases as part of Takiia operations without explicit owner approval.

## Before every production migration or deploy (required policy)

1. Create a logical backup of `takiia_db`.
2. Record Git commit SHA being deployed.
3. Confirm free disk space on the server for the dump file.
4. Store dumps outside the Git repository (e.g. `/var/backups/takiia/` with restricted permissions).

**Important:** `TAKIIA_CONFIRM_DB_BACKUP=yes` and the GitHub workflow input `confirm_db_backup` are **attestations only**. They do **not** create a backup. Deploy scripts require `TAKIIA_DB_BACKUP_PATH` to point to an existing, non-empty dump file on the server **only when Prisma reports pending migrations**.

## Suggested backup command (run on server as DB owner)

Use your approved PostgreSQL tooling. Example pattern (adjust paths and authentication):

```bash
# Run on server — uses peer/auth configured by DBA; do not commit credentials.
pg_dump -Fc -d takiia_db -f /var/backups/takiia/takiia_db_$(date +%Y%m%d_%H%M%S).dump
```

## Integrity checks (recommended)

| Check                          | Verified?                            |
| ------------------------------ | ------------------------------------ |
| Dump file non-zero size        | Manual each backup                   |
| `pg_restore --list` on archive | Manual spot-check                    |
| Restore to isolated test DB    | **Not verified** in this project yet |

## Restore procedure (outline)

1. Stop **only** `takiia-api` PM2 process (avoid affecting other sites).
2. Restore to a **temporary** database or replace `takiia_db` only with owner approval:

```bash
# Example — replace with approved runbook from DBA
pg_restore -d takiia_db_restore_test /var/backups/takiia/<file>.dump
```

3. Point staging or maintenance window restore at `takiia_db` per runbook.
4. Restart `takiia-api` and run health checks.

## Limitations (honest status)

| Item                                   | Status                      |
| -------------------------------------- | --------------------------- |
| Automated backup cron for Takiia       | **NOT CONFIGURED**          |
| Off-server backup replication          | **NOT CONFIGURED**          |
| Tested restore for `takiia_db`         | **NOT VERIFIED**            |
| VPS-wide backup policy for other sites | **UNKNOWN** — do not assume |

## Rollback without restore

If a deploy fails **before** a destructive migration, rollback Git + PM2 reload may be enough. If a migration ran, plan on restore from the pre-migration dump.
