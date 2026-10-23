import { mkdtempSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

const repoRoot = join(import.meta.dirname, '../../../..');
const patchScript = join(repoRoot, 'scripts/deploy/lib/patch-takiia-web-ecosystem.mjs');

describe('patch-takiia-web-ecosystem', () => {
  it('refuses ecosystems that include non-Takiia apps', () => {
    const dir = mkdtempSync(join(tmpdir(), 'takiia-eco-'));
    const file = join(dir, 'ecosystem.config.cjs');
    writeFileSync(
      file,
      `module.exports = { apps: [{ name: 'takiia-web' }, { name: 'ambition-holidays' }] };\n`,
    );
    try {
      execFileSync(process.execPath, [patchScript, file], { encoding: 'utf8', stdio: 'pipe' });
      throw new Error('expected patch to fail');
    } catch (err) {
      const stderr = err instanceof Error && 'stderr' in err ? String(err.stderr) : '';
      expect(stderr).toMatch(/unexpected apps/);
    }
  });

  it('patches takiia-web onto start-web.cjs and 3034', () => {
    const dir = mkdtempSync(join(tmpdir(), 'takiia-eco-'));
    const file = join(dir, 'ecosystem.config.cjs');
    writeFileSync(
      file,
      `module.exports = { apps: [{ name: 'takiia-api' }, { name: 'takiia-web', script: 'npm' }] };\n`,
    );
    const out = execFileSync(process.execPath, [patchScript, file], { encoding: 'utf8' });
    expect(out).toContain('STATUS=patched');
    const cfg = readFileSync(file, 'utf8');
    expect(cfg).toContain('scripts/deploy/start-web.cjs');
    expect(cfg).toContain('3034');
    expect(cfg).not.toContain('ambition');
  });
});
