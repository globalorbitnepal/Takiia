import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { remoteDeployScriptOrderIsValid } from '../../../../scripts/deploy/lib/remote-deploy-order.mjs';

const repoRoot = join(import.meta.dirname, '../../../..');
const remoteDeployPath = join(repoRoot, 'scripts/deploy/remote-deploy.sh');

describe('remote-deploy.sh order', () => {
  it('generates Prisma client and runs migrations before API build', () => {
    const script = readFileSync(remoteDeployPath, 'utf8');
    expect(remoteDeployScriptOrderIsValid(script)).toBe(true);
  });

  it('rejects build-before-generate ordering', () => {
    const bad =
      'npm ci\nnpm run build --workspace @takiia/api\nnpm run db:generate --workspace @takiia/api\nBuilding (must succeed before PM2 start/reload)\ntakiia_write_deploy_metadata\npm2_takiia_start_or_reload_both';
    expect(readFileSync(remoteDeployPath, 'utf8')).toContain('patch-takiia-web-ecosystem.mjs');
    expect(remoteDeployScriptOrderIsValid(bad)).toBe(false);
  });
});
