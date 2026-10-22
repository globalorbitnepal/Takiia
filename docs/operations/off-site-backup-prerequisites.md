# Encrypted off-site backup — prerequisites (not configured)

Template script: `scripts/backup/takiia-offsite-restic.sh.example`  
Design: [off-site-backup.md](off-site-backup.md)

## Before any upload

- Authorized S3-compatible bucket and **`takiia/`** prefix only.
- Dedicated IAM/user credentials (not in Git).
- `restic` installed on server as `takiia`.
- `RESTIC_PASSWORD` in vault + file mode `0600` on server.
- Billing/retention approval recorded.

## Verification after first upload

```bash
restic snapshots
restic check
```

Do not claim off-site protection until an encrypted snapshot is listed and `restic check` succeeds.

No production data has been uploaded as part of repository automation.
