# Production verification

## Public checks (no SSH)

```bash
curl -sS -o /dev/null -w "%{http_code}" https://takiia.com/pricing
```

Expect **200** and marketing content (not the legacy starter paragraph).

API health (safe fields only):

```bash
curl -sS https://api.takiia.com/health
```

Expect JSON with operational status. `commit` appears when `/srv/apps/takiia/.deploy-metadata.json` exists and `TAKIIA_APP_ROOT` is set for the API process.

## On-server checks (as `takiia`)

```bash
git -C /srv/apps/takiia rev-parse HEAD
test -f /srv/apps/takiia/.deploy-metadata.json && jq . /srv/apps/takiia/.deploy-metadata.json
pm2 describe takiia-api takiia-web
bash /srv/apps/takiia/scripts/deploy/verify-health.sh
```

When GitHub deploy passes `TAKIIA_EXPECTED_SHA`:

```bash
TAKIIA_EXPECTED_SHA=<sha> bash /srv/apps/takiia/scripts/deploy/verify-deploy.sh
```

## Distinguishing failure modes

| Symptom                | Likely cause                      |
| ---------------------- | --------------------------------- |
| HTTP 502/504           | Nginx or PM2 down                 |
| Starter homepage       | Old web build or wrong deploy SHA |
| Health OK, no `commit` | Missing `.deploy-metadata.json`   |
| Health DB error        | PostgreSQL or `DATABASE_URL`      |
| Deploy fails at SSH    | Wrong host fingerprint secret     |

## CI / local parity

```bash
npm run typecheck
npm test
bash scripts/deploy/ci-validate-deploy-scripts.sh
node scripts/deploy/ci-verify-deploy.mjs
```
