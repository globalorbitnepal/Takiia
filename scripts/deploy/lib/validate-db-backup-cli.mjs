#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { detectPostgresBackupFormat, postgresBackupContentsLookRestorable } from './validate-db-backup.mjs';

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
  if (!postgresBackupContentsLookRestorable(list.stdout || '')) {
    console.error('pg_restore --list has no restorable TABLE/SCHEMA entries');
    process.exit(1);
  }
  console.log('pg_custom');
  process.exit(0);
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
