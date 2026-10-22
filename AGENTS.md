# Cursor Agent — Takiia operations

Local project: `C:\Users\User\Desktop\Takiia`  
Repository: `globalorbitnepal/Takiia`  
Production: `takiia@51.15.21.166`, app root `/srv/apps/takiia`  
Public: `https://takiia.com`, API `https://api.takiia.com`

## Verify before acting

1. Confirm workspace path and `git remote -v` → `globalorbitnepal/Takiia`.
2. SSH host ED25519 fingerprint must be  
   `SHA256:OcDdcR3jir76uLahlZtQfMcI+VOwgkiV2KdtT0P2U+s`  
   Never disable `StrictHostKeyChecking`.
3. Production deploy SSH key (local, not in repo):  
   `%USERPROFILE%\.ssh\github-actions-globalorbitnepal` as user `takiia`.
4. Check tooling: `git`, `ssh`, `gh`. On Windows, if `gh` is not found, use  
   `C:\Program Files\GitHub CLI\gh.exe` or add that folder to your **User** `PATH` (Cursor shells may need a restart).

## Normal development

Work on a feature branch. Run tests and typecheck before pushing:

```powershell
cd C:\Users\User\Desktop\Takiia
npm run build --workspace=@takiia/shared
npm test --workspace=@takiia/api
npm run typecheck
npm run lint
& "C:\Program Files\Git\bin\bash.exe" -lc "cd /c/Users/User/Desktop/Takiia && bash scripts/deploy/ci-validate-deploy-scripts.sh"
```

Do not stage `.env`, keys, dumps, or secrets. Do not use `git reset --hard`, `git clean -fd`, or force-push to `main`.

## Deployment mechanisms (preference order)

### A — Direct SSH (same scripts as CI)

Use when the **exact commit** is approved (usually `origin/main` after merge) and all safety gates pass:

1. Fresh backup if migrations pending (`scripts/backup/takiia-db-backup.sh` on server).
2. SSH as `takiia`, under `/srv/apps/takiia`:
   - `TAKIIA_DEPLOY_REF=<40-char-sha> TAKIIA_ENFORCE_MAIN_ONLY=0 bash scripts/deploy/git-sync.sh`
   - `bash scripts/deploy/remote-deploy.sh`
3. Post-check: `.deploy-metadata.json`, `/health`, `/health/ready`, `pm2` **only** `takiia-api` / `takiia-web`.

Rollback: `docs/rollback.md`, `.deploy-last-known-good`, checkout previous SHA, re-run `remote-deploy.sh` (Takiia PM2 only). Never `pm2 reload all`.

### B — GitHub Actions `Deploy Production`

Requires `gh` or API auth, `TAKIIA_PRODUCTION_DEPLOY=true`, SSH secrets/fingerprint configured. See `docs/operations/github-deploy-checklist.md`.

Do not create a second deploy path. Do not bypass branch protection or required reviews.

## Phrase: `PUSH AND DEPLOY LIVE`

Only this exact phrase authorizes the agent to run the **full** preflight, commit/push (if needed), and production deploy workflow. It does **not** authorize destructive DB ops, unrelated server changes, or bypassing failed gates.

Preflight checklist:

| Gate         | Requirement                                                        |
| ------------ | ------------------------------------------------------------------ |
| Commit       | Known 40-char SHA; branch policy satisfied (PR merged if required) |
| Working tree | Understood; no secrets in commit                                   |
| Tests        | API tests, typecheck, lint, deploy-script validation               |
| SSH          | Fingerprint match; `takiia` access                                 |
| DB           | `prisma migrate status` — backup if pending migrations             |
| Backup       | Recent non-empty dump + `sha256sum -c`                             |
| Scope        | Only Takiia PM2/nginx/db                                           |

If any gate fails, stop before production writes and report the blocker.

## GitHub without browser

- [GitHub CLI](https://cli.github.com/) is installed at `C:\Program Files\GitHub CLI` on this machine; run `gh auth login` once per account.
- Create PR: `gh pr create --base main --head <branch>`.
- Watch CI: `gh pr checks`, `gh run watch`.
- Dispatch deploy: `gh workflow run deploy-production.yml --ref main`.

Unauthenticated API cannot read variables/secrets or open PRs.

## Blocked until human setup

- Encrypted off-site backup (`restic` + approved bucket): `docs/operations/off-site-backup-prerequisites.md`
- Isolated restore test (DBA `CREATEDB` / empty `takiia_dr_test_*`): `docs/operations/restore-test-prerequisites.md`
- Authenticated upload API test (dedicated test user)

## Key docs

- `docs/deployment.md`, `docs/rollback.md`
- `docs/operations/production-deployment.md`
- `docs/operations/production-readiness-progress.md`
