/**
 * Shared backup gate helpers (bash scripts + CI tests). No secret handling.
 */

const PRODUCTION_DB_SEGMENT = /\/takiia_db(\?|$)/;

/** @param {string} url */
export function isTakiiaProductionDatabaseUrl(url) {
  if (!url || typeof url !== 'string') {
    return false;
  }
  return PRODUCTION_DB_SEGMENT.test(url);
}

/** Restore tests must not target production database name. */
export function isForbiddenRestoreTestDatabaseUrl(url) {
  return isTakiiaProductionDatabaseUrl(url);
}

/** @param {string} basename e.g. takiia_db_backup_20261023_001716.dump */
export function isValidTakiiaBackupBasename(basename) {
  return /^takiia_db_backup_\d{8}_\d{6}\.dump$/.test(basename);
}

/** @param {string} listOutput pg_restore --list */
export function countTableDataEntries(listOutput) {
  if (!listOutput) {
    return 0;
  }
  return listOutput.split(/\r?\n/).filter((line) => line.includes('TABLE DATA')).length;
}
