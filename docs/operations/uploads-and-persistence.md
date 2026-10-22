# Uploads and persistent files

## Application behavior (code)

Attachments use **local disk** via Multer (`apps/api/src/routes/attachments.ts`):

- Directory: `UPLOAD_DIR` from `apps/api/.env` (default `./uploads` relative to API cwd).
- Files stored as `storageKey` filenames under that directory.
- Not tracked in Git.

Production env example: `docs/production-environment.md` suggests `/srv/apps/takiia/uploads` or `apps/api/uploads` under app root.

## Verified server state (read-only SSH)

| Check                               | Result                                                 |
| ----------------------------------- | ------------------------------------------------------ |
| PM2 `takiia-api` `exec cwd`         | **`/srv/apps/takiia`** (verified 2026-10-23)           |
| Default `./uploads` resolved path   | **`/srv/apps/takiia/uploads`** — **directory missing** |
| `/srv/apps/takiia/apps/api/uploads` | **Absent**                                             |

**Inference:** Either no attachment uploads in production yet, or `UPLOAD_DIR` points elsewhere (verify in vault-backed `.env` without printing values).

## Backup strategy (prepared, not executed)

1. **Include in DB backup:** attachment **metadata** in PostgreSQL (`Attachment` rows).
2. **Include in filesystem backup:** whatever path `UPLOAD_DIR` resolves to on the server.
3. **Off-site:** add `UPLOAD_DIR` to restic file set when off-site is approved (`docs/operations/off-site-backup.md`).
4. **Recovery:** restore DB + restore files to the same path with owner `takiia` and mode consistent with API write needs.

## Pre-deploy checklist (operator)

- Confirm `UPLOAD_DIR` exists and is owned by `takiia`.
- Ensure path is on durable disk (not tmpfs).
- Document absolute path in secure ops notes (not in Git).

Do not copy production upload files to the Windows dev tree.
