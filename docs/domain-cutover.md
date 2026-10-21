# Domain cutover plan (documentation only)

**Status:** Not applied. **takiia.com** currently shows **Ambition Holidays** based on available evidence, not on live server inspection in this task.

## Likely cause (evidence-based)

1. **No dedicated Takiia Nginx vhost** is documented as installed for `takiia.com`, `www.takiia.com`, or `api.takiia.com`.
2. The production server already hosts **Ambition Holidays**, **Global Orbit Nepal**, and **HostingBeyond** with Nginx `server_name` routing to local upstream ports (e.g. 3030–3032).
3. When a hostname has **no matching** `server_name`, Nginx uses the **default** SSL server for that `listen` socket — typically the first `server` block loaded for `443`. On a shared host, that default HTTPS vhost can still be **Ambition Holidays** (or another existing site) even though the browser URL says `takiia.com`. Adding a dedicated Takiia `server_name` block is what changes that behavior; until then, public URLs may show the wrong application without any Takiia code running.
4. **Takiia is not live** at the public domain until DNS, TLS, Nginx, PM2, and app health are all verified end-to-end.

## Target routing (after approval)

| Hostname                       | Upstream                                     | Template                          |
| ------------------------------ | -------------------------------------------- | --------------------------------- |
| `takiia.com`, `www.takiia.com` | `127.0.0.1:3034`                             | `infra/nginx/takiia.conf.example` |
| `api.takiia.com`               | `127.0.0.1:3033` (+ `/socket.io/` WebSocket) | same                              |

## Certificate and Cloudflare

- Origin certificates (e.g. Certbot) for all three names on the VPS.
- Cloudflare DNS: proxied A records to origin.
- SSL mode: **Full (strict)** once origin certs exist.

## Risks (not zero)

- A syntax error in **any** new Nginx file can cause `nginx -t` to fail or, if reloaded carelessly, disrupt **all** vhosts.
- Shared `nginx reload` affects the whole daemon; schedule a maintenance window.
- Test Takiia **only on localhost** (`3033`/`3034`) and optionally via `/etc/hosts` or temporary hostname **before** switching public DNS.

## Safe cutover sequence (manual, approved)

1. Deploy Takiia app to `/srv/apps/takiia`; PM2 `takiia-api` / `takiia-web` only; localhost health OK.
2. Add **new** Nginx site file (do not edit Ambition/HostingBeyond files); `nginx -t`.
3. Obtain TLS certs for Takiia hostnames.
4. Reload Nginx in a window; verify `curl -k` / hosts file to Takiia upstreams.
5. Update Cloudflare DNS to origin (or confirm records).
6. Public verification: `https://api.takiia.com/health`, `https://takiia.com/api/health`.
7. Rollback: disable Takiia site symlink, `nginx -t`, reload; DNS revert if needed.

**Do not claim the domain is fixed until step 6 succeeds in production.**
