import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const migrateSh = readFileSync(
  join(import.meta.dirname, '../../../../scripts/deploy/lib/migrate.sh'),
  'utf8',
);

describe('migrate.sh errexit safety', () => {
  it('does not re-enable set -e before returning "up to date" (return 1)', () => {
    const fnBody = migrateSh.slice(migrateSh.indexOf('takiia_prisma_migrate_pending()'));
    expect(fnBody).not.toMatch(
      /status_code=\$\?\s*\n\s*set -e\s*\n\s*if \[\[ "\$\{status_code\}" -eq 0 \]\]/,
    );
  });
});
