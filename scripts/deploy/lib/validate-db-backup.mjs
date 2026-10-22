/**
 * PostgreSQL backup validation helpers (shared by bash gate and CI unit tests).
 * Does not run pg_restore; callers supply file headers or pg_restore --list output.
 */

const PG_CUSTOM_MAGIC = 'PGDMP';
const PLAIN_DUMP_MARKERS = ['PostgreSQL database dump', 'PostgreSQL custom database dump'];

/** @param {string} header First bytes or lines of a backup file (UTF-8). */
export function detectPostgresBackupFormat(header) {
  if (header.startsWith(PG_CUSTOM_MAGIC)) {
    return 'pg_custom';
  }
  for (const marker of PLAIN_DUMP_MARKERS) {
    if (header.includes(marker)) {
      return 'pg_plain';
    }
  }
  return 'unknown';
}

/**
 * True when pg_restore --list (custom format) or pg_dump plain output includes real schema objects.
 * @param {string} listOrDumpText
 */
export function postgresBackupContentsLookRestorable(listOrDumpText) {
  const lines = listOrDumpText.split(/\r?\n/);
  for (const line of lines) {
    if (/;\s+\d+\s+\d+\s+TABLE DATA\b/.test(line)) {
      return true;
    }
    if (/;\s+\d+\s+\d+\s+TABLE\b/.test(line)) {
      return true;
    }
    if (/;\s+\d+\s+\d+\s+SCHEMA\b/.test(line) && /\bpublic\b/.test(line)) {
      return true;
    }
    if (/^\s*CREATE TABLE\b/i.test(line)) {
      return true;
    }
  }
  return false;
}

/**
 * True when pg_restore --list succeeded but lists no application schema objects.
 * Used only with a live read-only check that production has no tables yet (first migrate).
 * Does not imply recoverability of user or application data.
 */
export function postgresBackupIsEmptyCustomCatalog(listOrDumpText) {
  if (postgresBackupContentsLookRestorable(listOrDumpText)) {
    return false;
  }
  const lines = listOrDumpText.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) {
    return false;
  }
  return lines.some((line) => line.startsWith(';'));
}
