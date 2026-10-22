# Off-site encrypted backup (design)

**Status: NOT IMPLEMENTED** — no restic repository initialized, no production data uploaded.

## Goals

- Client-side encryption (e.g. **restic**)
- S3-compatible bucket with prefix `takiia/` only
- Dedicated credentials (read/write to prefix only)
- Password file mode `0600`; password stored separately in vault
- After upload: `restic check` and snapshot list verification
- Retention policy scoped to `takiia/` snapshots only

## Prerequisites (human)

1. Choose provider and create bucket/prefix
2. Create IAM/user credentials with minimum permissions
3. Store `RESTIC_PASSWORD` in vault; create `/home/takiia/.config/takiia/restic-password` (`0600`)
4. `restic init -r s3:s3.amazonaws.com/<bucket>/takiia` (example — adjust endpoint)

## Suggested backup set

- `/var/backups/takiia/takiia_db_backup_*.dump` and `.sha256` files
- Optional: encrypted tarball of `apps/api/uploads` if uploads are enabled later

## Monitoring

Alert on: backup script failure, restic failure, no new snapshot within 26h, checksum mismatch.

Do not run `restic` against other applications' paths on the shared server.
