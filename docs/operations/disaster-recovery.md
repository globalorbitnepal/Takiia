# Disaster recovery (Takiia)

## Recovery objectives (evidence-based)

| Metric | Current state                                         |
| ------ | ----------------------------------------------------- |
| RPO    | **Unknown** until daily + off-site backups are proven |
| RTO    | **Unknown** — manual runbooks only                    |

## Runbook B — application process failure

1. Confirm issue is Takiia-only (do not restart unrelated PM2 apps).
2. SSH as `takiia`: `pm2 status takiia-api takiia-web`
3. Logs: `pm2 logs takiia-api --lines 100` (avoid dumping env).
4. Check `https://takiia.com/pricing` and API `/health`.
5. If code rollback needed: deploy previous **approved** `main` SHA via GitHub Actions, not ad-hoc file copies.
6. Reload only `takiia-api` and `takiia-web`.

## Runbook C — database recovery

1. Identify failure scope (`takiia_db` only).
2. Select checksum-verified dump (`sha256sum -c file.dump.sha256`).
3. Confirm dump age and `pg_restore --list` table data count.
4. **Stop writes:** stop `takiia-api` only.
5. **Explicit approval** required before any restore to `takiia_db`.
6. Prefer restore to isolated DB first: `takiia_dr_test_YYYYMMDD` using [takiia-restore-test.sh](../../scripts/backup/takiia-restore-test.sh) with `TAKIIA_RESTORE_TEST_EXECUTE=1`.
7. Validate `_prisma_migrations`, `Plan` row count (expect 4 when seed state matches production), referential integrity.
8. Production restore only with written approval and recorded data-loss window.

## Runbook D — total server loss

Requires rebuilding:

| Asset                             | Backup status                                                                             |
| --------------------------------- | ----------------------------------------------------------------------------------------- |
| Application code                  | GitHub `main`                                                                             |
| `apps/api/.env`, web env          | Secure vault / offline encrypted copy — **not in Git**                                    |
| PostgreSQL `takiia_db`            | On-server dumps under `/var/backups/takiia/` — **off-site not verified**                  |
| User uploads (`apps/api/uploads`) | **Directory absent on server at last audit** — confirm if storage moved to object storage |
| TLS certificates                  | Re-issue on new origin                                                                    |
| DNS                               | Cloudflare → new origin IP                                                                |
| Deploy SSH keys                   | GitHub Actions secret + server `authorized_keys`                                          |
| PM2 ecosystem                     | `ecosystem.config.cjs` on server (track in Git example + server copy)                     |

Do not restore other tenants' databases or Nginx vhosts while recovering Takiia.
