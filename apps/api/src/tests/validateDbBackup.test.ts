import { describe, expect, it } from 'vitest';
import {
  detectPostgresBackupFormat,
  postgresBackupContentsLookRestorable,
} from '../../../../scripts/deploy/lib/validate-db-backup.mjs';

describe('validate-db-backup', () => {
  it('detects custom-format pg_dump header', () => {
    expect(detectPostgresBackupFormat('PGDMP\x01')).toBe('pg_custom');
  });

  it('detects plain SQL dump header', () => {
    expect(detectPostgresBackupFormat('-- PostgreSQL database dump\n')).toBe('pg_plain');
  });

  it('rejects empty pg_restore list output', () => {
    expect(postgresBackupContentsLookRestorable(';\n')).toBe(false);
  });

  it('accepts pg_restore list with TABLE entries', () => {
    const list = '; 123 456 TABLE public users postgres\n';
    expect(postgresBackupContentsLookRestorable(list)).toBe(true);
  });
});
