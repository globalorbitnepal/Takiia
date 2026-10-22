import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const verifyHealthSh = readFileSync(
  join(import.meta.dirname, '../../../../scripts/deploy/verify-health.sh'),
  'utf8',
);

describe('verify-health.sh retry behavior', () => {
  it('waits up to 30s for localhost health after PM2 reload', () => {
    expect(verifyHealthSh).toMatch(/for attempt in \$\(seq 1 30\)/);
    expect(verifyHealthSh).toMatch(/sleep 1/);
    expect(verifyHealthSh).toMatch(/health check failed after 30s/);
  });

  it('requires JSON status ok, not merely HTTP success', () => {
    expect(verifyHealthSh).toContain('grep -q \'\"status\"[[:space:]]*:[[:space:]]*\"ok\"\'');
  });

  it('restricts checks to 127.0.0.1 Takiia ports', () => {
    expect(verifyHealthSh).toContain('127.0.0.1:3033');
    expect(verifyHealthSh).toContain('127.0.0.1:3034');
  });
});
