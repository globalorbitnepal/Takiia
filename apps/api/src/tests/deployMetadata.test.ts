import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { readDeployCommitFromAppRoot } from '@takiia/shared';

describe('readDeployCommitFromAppRoot', () => {
  it('returns commit from .deploy-metadata.json', () => {
    const dir = mkdtempSync(join(tmpdir(), 'takiia-deploy-meta-'));
    const commit = 'a'.repeat(40);
    try {
      writeFileSync(
        join(dir, '.deploy-metadata.json'),
        JSON.stringify({ commit, deployedAt: '2026-01-01T00:00:00Z' }),
        'utf8',
      );
      expect(readDeployCommitFromAppRoot(dir)).toBe(commit);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('returns undefined when metadata is missing', () => {
    const dir = mkdtempSync(join(tmpdir(), 'takiia-deploy-meta-'));
    try {
      expect(readDeployCommitFromAppRoot(dir)).toBeUndefined();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
