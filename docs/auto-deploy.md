# Automatic deploy after first success

**Status: INACTIVE.** Production deploy today is **manual** (`workflow_dispatch` only). Automatic deploy on CI success is **prepared but not enabled**.

## Prerequisites

1. First **manual** deploy succeeded (localhost health on 3033/3034 and `verify-deploy.sh` passed).
2. Optional: public domain cutover verified if you use `TAKIIA_VERIFY_PUBLIC_HEALTH`.
3. Explicit approval to enable automation.

## Enable (two steps — both required)

### 1. Repository variable

| Variable                   | Value              |
| -------------------------- | ------------------ |
| `TAKIIA_AUTO_DEPLOY`       | `true`             |
| `TAKIIA_PRODUCTION_DEPLOY` | Must remain `true` |

### 2. Workflow trigger

In `.github/workflows/deploy-production.yml`, uncomment the `workflow_run` block at the top (and keep `workflow_dispatch` for manual runs).

Add a **job-level guard** on `guard` (and `deploy`) so auto-runs only fire for CI success:

```yaml
jobs:
  guard:
    if: >-
      github.event_name == 'workflow_dispatch' ||
      (github.event_name == 'workflow_run' &&
       github.event.workflow_run.conclusion == 'success' &&
       vars.TAKIIA_AUTO_DEPLOY == 'true' &&
       vars.TAKIIA_PRODUCTION_DEPLOY == 'true')
```

### 3. CI SHA for `workflow_run` events

When `github.event_name == 'workflow_run'`, set the deploy SHA from the CI run instead of re-querying `main`:

```bash
if [ "${GITHUB_EVENT_NAME}" = "workflow_run" ]; then
  SHA="${{ github.event.workflow_run.head_sha }}"
else
  SHA="$(gh api "repos/${GITHUB_REPOSITORY}/commits/main" --jq .sha)"
fi
```

Then run the same `check_ci_job` checks against that `SHA`. Commit this change **with** enabling the trigger.

Push to `main` and confirm one intentional auto-deploy before relying on it.

## Disable immediately (failed deploy or incident)

1. Set **`TAKIIA_AUTO_DEPLOY`** to `false` or delete the variable.
2. Set **`TAKIIA_PRODUCTION_DEPLOY`** to `false` to block **all** deploy workflows (manual included).
3. Re-comment the `workflow_run` block if you want zero automatic triggers.
4. On server: manual recovery per [rollback.md](rollback.md) (checkout `.deploy-last-known-good` or known SHA, rebuild, PM2 reload **takiia-api** / **takiia-web** only).

## Least privilege

- Deploy SSH user: **`takiia`** only.
- Scripts touch **`/srv/apps/takiia`**, **`takiia_db`**, PM2 names **`takiia-api`** / **`takiia-web`** only.
- GitHub **production** environment reviewers remain recommended for manual approval on each deploy if you keep `workflow_dispatch` alongside auto.
