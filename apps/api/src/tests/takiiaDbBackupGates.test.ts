import { describe, expect, it } from 'vitest';
import {
  countTableDataEntries,
  isForbiddenRestoreTestDatabaseUrl,
  isTakiiaProductionDatabaseUrl,
  isValidTakiiaBackupBasename,
} from '../../../../scripts/backup/lib/takiia-db-backup-gates.mjs';

describe('takiia-db-backup gates', () => {
  it('accepts only takiia_db production URLs', () => {
    expect(isTakiiaProductionDatabaseUrl('postgresql://u:p@localhost:5432/takiia_db')).toBe(true);
    expect(
      isTakiiaProductionDatabaseUrl('postgresql://u:p@localhost:5432/takiia_db?schema=public'),
    ).toBe(true);
    expect(isTakiiaProductionDatabaseUrl('postgresql://u:p@localhost:5432/takiia_test')).toBe(
      false,
    );
    expect(isTakiiaProductionDatabaseUrl('postgresql://u:p@localhost:5432/other_takiia_db')).toBe(
      false,
    );
  });

  it('rejects production URL for restore test targets', () => {
    expect(isForbiddenRestoreTestDatabaseUrl('postgresql://localhost/takiia_db')).toBe(true);
    expect(
      isForbiddenRestoreTestDatabaseUrl('postgresql://localhost/takiia_dr_test_20261023'),
    ).toBe(false);
  });

  it('validates backup filename pattern', () => {
    expect(isValidTakiiaBackupBasename('takiia_db_backup_20261023_001716.dump')).toBe(true);
    expect(isValidTakiiaBackupBasename('takiia_db_backup_evil.dump')).toBe(false);
    expect(isValidTakiiaBackupBasename('../etc/passwd')).toBe(false);
  });

  it('counts TABLE DATA lines from pg_restore list', () => {
    const sample = '; comment\n; 1 TABLE DATA public users\n; 2 TABLE DATA public plans\n';
    expect(countTableDataEntries(sample)).toBe(2);
    expect(countTableDataEntries(';\n')).toBe(0);
  });
});
