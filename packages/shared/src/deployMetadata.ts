import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const COMMIT_RE = /^[0-9a-f]{40}$/;

/** Reads `.deploy-metadata.json` from the app root (PM2 cwd). Never throws. */
export function readDeployCommitFromAppRoot(appRoot?: string): string | undefined {
  const root = appRoot ?? process.cwd();
  try {
    const raw = readFileSync(join(root, '.deploy-metadata.json'), 'utf8');
    const parsed = JSON.parse(raw) as { commit?: string };
    const commit = parsed.commit?.trim();
    if (commit && COMMIT_RE.test(commit)) {
      return commit;
    }
  } catch {
    // Missing or invalid metadata — omit commit from health.
  }
  return undefined;
}
