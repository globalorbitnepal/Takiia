# npm audit — findings and safe remediation (proposal)

**Status:** Informational only. **No** `npm audit fix --force` was run. Package versions were **not** changed in this pass unless required for deployment prep (none required).

## Summary

`npm audit` reports vulnerabilities primarily through **transitive dev/tooling chains**:

- **Expo / React Native / Metro / Jest** (mobile app toolchain)
- **eslint-config-next / @next/eslint-plugin-next** (web lint tooling)

Production runtime surfaces are narrower:

- **API:** Express, Socket.IO, Prisma, Zod
- **Web:** Next.js, React (production `next build` / `next start`)

Many reported issues are **dev-only** (lint, test, Metro bundler) and do not ship to the API process or the Next.js server bundle in the same form.

## Recommended approach (when you choose to act)

1. **Re-run audit scoped per workspace** (reduces noise):
   - `npm audit --workspace @takiia/api`
   - `npm audit --workspace @takiia/web`
   - `npm audit --workspace @takiia/mobile`
2. **Apply `npm audit fix` without `--force`** on the root lockfile first; review the diff to `package-lock.json`.
3. **Do not** accept breaking upgrades (e.g. `expo@58` suggested by audit for `braces`) without a dedicated mobile upgrade task and device testing.
4. **Track upstream:** Next.js and Expo release notes for security patches compatible with current major versions (`next@15`, `expo@54`).
5. **CI:** Keep `npm ci` reproducible; commit lockfile changes only after local `typecheck` / `build` / Expo smoke test.

## Explicitly not done

- `npm audit fix --force`
- Major version bumps of Expo, Next.js, or React Native for audit alone

## Re-check after changes

```bash
npm audit
npm run typecheck
npm run build --workspace @takiia/api
npm run build --workspace @takiia/web
```
