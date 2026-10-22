import { describe, expect, it } from 'vitest';
import { resolveUploadDir } from '@takiia/shared';

describe('resolveUploadDir', () => {
  it('joins relative upload dir to PM2 exec cwd on production', () => {
    expect(resolveUploadDir('./uploads', '/srv/apps/takiia')).toBe('/srv/apps/takiia/uploads');
  });

  it('keeps absolute paths', () => {
    expect(resolveUploadDir('/var/takiia/uploads', '/srv/apps/takiia')).toBe('/var/takiia/uploads');
  });
});
