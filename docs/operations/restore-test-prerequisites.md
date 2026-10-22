# Isolated restore test — prerequisites

Script: `scripts/backup/takiia-restore-test.sh`

## DBA permission required

Role **`takiia_app`** cannot `CREATE DATABASE` (verified: `permission denied to create database`).

A **PostgreSQL superuser** or role with **`CREATEDB`** must:

1. Confirm no database named `takiia_dr_test_YYYYMMDD` exists.
2. Create empty database owned by `takiia_app` (or a dedicated restore-test role).
3. Provide connection URL via **`TAKIIA_RESTORE_TEST_DATABASE_URL`** (never `takiia_db`).

## Safe execution

```bash
export TAKIIA_RESTORE_TEST_DATABASE_URL='postgresql://...@127.0.0.1:5432/takiia_dr_test_YYYYMMDD'
export TAKIIA_RESTORE_TEST_EXECUTE=1
scripts/backup/takiia-restore-test.sh /var/backups/takiia/takiia_db_backup_<verified>.dump
```

Validate: `_prisma_migrations`, table counts, `Plan` row count, no production URL.

Do not drop production databases. Do not restore into `takiia_db` without explicit written approval.
