# GitHub Deploy Production — operator checklist

Use after merging deploy fixes to `main`. Do not expose secret values in tickets or chat.

## Preconditions

1. `origin/main` SHA matches the intended release (CI green on that commit).
2. Repository variable **`TAKIIA_PRODUCTION_DEPLOY`** = `true` (verify in GitHub → Settings → Secrets and variables → Actions → Variables).
3. Secrets **present** (names only; values are masked):
   - `TAKIIA_PRODUCTION_SSH_HOST`
   - `TAKIIA_PRODUCTION_SSH_USER` (`takiia`)
   - `TAKIIA_PRODUCTION_SSH_PRIVATE_KEY`
   - `TAKIIA_PRODUCTION_SSH_HOST_FINGERPRINT`
4. **Host fingerprint** must match server ED25519 key independently, expected:
   `SHA256:OcDdcR3jir76uLahlZtQfMcI+VOwgkiV2KdtT0P2U+s`
   (Verify on a trusted admin workstation: `ssh-keyscan -t ed25519 <host> | ssh-keygen -lf - -E sha256`.)

## Migration / backup inputs

On server (read-only first):

```bash
cd /srv/apps/takiia/apps/api && npx prisma migrate status
```

| Migrate status                | Workflow inputs                                                                                                                                            |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Database schema is up to date | `confirm_db_backup` = **no**                                                                                                                               |
| Pending migrations            | Run `scripts/backup/takiia-db-backup.sh` as `takiia`, then `confirm_db_backup` = **yes** and `db_backup_path` = absolute path under `/var/backups/takiia/` |

Never bypass failed backup or database identity gates.

## Run workflow

1. Actions → **Deploy Production** → **Run workflow** on branch **`main`**.
2. Wait for **Verify deploy gate** then **SSH deploy to server**.
3. If optional public verify is enabled (`TAKIIA_VERIFY_PUBLIC_HEALTH=true`), health JSON must include the deployed `commit`.

## Post-deploy verification

- `git -C /srv/apps/takiia rev-parse HEAD`
- `cat /srv/apps/takiia/.deploy-metadata.json` (commit + deployedAt only)
- `https://api.takiia.com/health` and `/health/ready`
- `https://takiia.com/pricing` → HTTP 200
