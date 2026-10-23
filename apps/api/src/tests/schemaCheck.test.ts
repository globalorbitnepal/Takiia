import { describe, expect, it } from 'vitest';
import {
  TAKIIA_REQUIRED_PUBLIC_TABLES,
  diffRequiredTables,
  isTakiiaDbUrl,
} from '../lib/schemaCheck.js';

describe('schemaCheck', () => {
  it('accepts only takiia_db production URLs', () => {
    expect(isTakiiaDbUrl('postgresql://u:p@127.0.0.1:5432/takiia_db')).toBe(true);
    expect(isTakiiaDbUrl('postgresql://u:p@127.0.0.1:5432/takiia_db?schema=public')).toBe(true);
    expect(isTakiiaDbUrl('postgresql://u:p@127.0.0.1:5432/takiia_dev')).toBe(false);
    expect(isTakiiaDbUrl('postgresql://u:p@127.0.0.1:5432/ambition')).toBe(false);
  });

  it('reports missing required tables without treating extras as failure input', () => {
    const present = TAKIIA_REQUIRED_PUBLIC_TABLES.filter((name) => name !== 'Plan');
    const diff = diffRequiredTables([...present, 'pg_stat_statements']);
    expect(diff.missing).toEqual(['Plan']);
    expect(diff.extra).toContain('pg_stat_statements');
  });
});
