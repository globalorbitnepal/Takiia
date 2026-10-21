import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const apiRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const resultsPath = path.join(process.env.RUNNER_TEMP || tmpdir(), 'vitest-results.json');

function ghError(message) {
  const escaped = String(message).replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
  console.error(`::error::${escaped}`);
}

async function smoke() {
  const url = process.env.DATABASE_URL ?? '';
  if (!url.includes('takiia_test')) {
    throw new Error('DATABASE_URL must include takiia_test for CI integration tests');
  }
  const { env } = await import('../src/config/env.ts');
  console.log(`ci-smoke env.nodeEnv=${env.nodeEnv}`);
  const { prisma } = await import('../src/lib/prisma.ts');
  const plans = await prisma.plan.count();
  console.log(`ci-smoke plans=${plans}`);
  if (plans < 1) {
    throw new Error('Plan seed missing from takiia_test');
  }
  const { createApp } = await import('../src/app.ts');
  createApp();
  console.log('ci-smoke createApp ok');
  await prisma.$disconnect();
}

function printVitestFailures() {
  if (!existsSync(resultsPath)) {
    ghError('vitest-results.json was not written');
    return;
  }
  const report = JSON.parse(readFileSync(resultsPath, 'utf8'));
  const files = report.testResults ?? report;
  console.log(`ci-smoke vitest numFailedTests=${report.numFailedTests ?? '?'}`);
  for (const file of report.testResults ?? []) {
    for (const assertion of file.assertionResults ?? []) {
      if (assertion.status === 'failed') {
        const message = (assertion.failureMessages ?? []).join('\n') || assertion.title;
        ghError(`${file.name} > ${assertion.fullName}: ${message}`);
      }
    }
  }
}

try {
  await smoke();
} catch (error) {
  ghError(error instanceof Error ? (error.stack ?? error.message) : String(error));
  process.exit(1);
}

const vitest = spawnSync(
  'npx',
  ['vitest', 'run', '--reporter=verbose', '--reporter=json', `--outputFile=${resultsPath}`],
  { cwd: apiRoot, stdio: 'inherit', shell: true, env: process.env },
);

printVitestFailures();
process.exit(vitest.status === 0 ? 0 : (vitest.status ?? 1));
