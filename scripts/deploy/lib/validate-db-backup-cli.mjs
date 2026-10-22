#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import {
  detectPostgresBackupFormat,
  postgresBackupContentsLookRestorable,
  postgresBackupIsEmptyCustomCatalog,
} from './validate-db-backup.mjs';

const allowEmptyCustomBaseline = process.env.TAKIIA_ALLOW_EMPTY_CUSTOM_BASELINE === '1';

const [command, filePath] = process.argv.slice(2);

if (!command || !filePath) {
  console.error('usage: validate-db-backup-cli.mjs <validate-file> <path>');
  process.exit(2);
}

if (command !== 'validate-file') {
  console.error(`unknown command: ${command}`);
  process.exit(2);
}

const header = readFileSync(filePath).subarray(0, 64).toString('utf8');
const format = detectPostgresBackupFormat(header);

if (format === 'pg_custom') {
  const list = spawnSync('pg_restore', ['--list', filePath], { encoding: 'utf8' });
  if (list.status !== 0) {
    console.error(list.stderr || list.stdout || 'pg_restore --list failed');
    process.exit(1);
  }
  const listText = list.stdout || '';
  if (postgresBackupContentsLookRestorable(listText)) {
    console.log('pg_custom');
    process.exit(0);
  }
  if (allowEmptyCustomBaseline && postgresBackupIsEmptyCustomCatalog(listText)) {
    console.log('pg_custom_empty_baseline');
    process.exit(0);
  }
  console.error('pg_restore --list has no restorable TABLE/SCHEMA entries');
  process.exit(1);
}

if (format === 'pg_plain') {
  const text = readFileSync(filePath, 'utf8');
  if (!postgresBackupContentsLookRestorable(text)) {
    console.error('plain SQL dump has no CREATE TABLE / schema entries');
    process.exit(1);
  }
  console.log('pg_plain');
  process.exit(0);
}

console.error('unsupported or unknown PostgreSQL backup format');
process.exit(1);
