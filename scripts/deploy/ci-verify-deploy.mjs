/**
 * Offline tests for verify-deploy.sh (no production SSH or credentials).
 * Full bash integration runs on Linux CI; Windows runs unit checks only.
 */
import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homepageIsLegacyStarter } from './lib/legacy-homepage.mjs';
import {
  detectPostgresBackupFormat,
  postgresBackupContentsLookRestorable,
  postgresBackupIsEmptyCustomCatalog,
} from './lib/validate-db-backup.mjs';
import { remoteDeployScriptOrderIsValid } from './lib/remote-deploy-order.mjs';
import { readFileSync } from 'node:fs';

const scriptDir = fileURLToPath(new URL('.', import.meta.url));
const verifyScript = join(scriptDir, 'verify-deploy.sh');

function toBashPath(filePath) {
  if (process.platform !== 'win32') {
    return filePath;
  }
  const match = /^([A-Za-z]):[\\/](.*)$/.exec(filePath);
  if (!match) {
    return filePath;
  }
  return `/${match[1].toLowerCase()}/${match[2].replace(/\\/g, '/')}`;
}

const LEGACY_HOME = `<!DOCTYPE html><html><body><main><h1>Takiia</h1><p>Starter web app for messaging and calling. Authentication and chat are not enabled yet.</p><section class="card" aria-label="Local development"><dd>http://localhost:4000/health</dd></section></main><script src="/_next/static/chunks/main.js"></script></body></html>`;

const MODERN_HOME = `<!DOCTYPE html><html><body><div class="hero">Marketing workspace</div><script src="/_next/static/chunks/main.js"></script></body></html>`;

function runUnitTests() {
  if (detectPostgresBackupFormat('PGDMP') !== 'pg_custom') {
    throw new Error('expected PGDMP custom backup format');
  }
  if (!postgresBackupContentsLookRestorable('; 1 2 TABLE public plans postgres\n')) {
    throw new Error('expected TABLE entry in pg_restore list');
  }
  if (postgresBackupContentsLookRestorable(';\n')) {
    throw new Error('empty pg_restore list should not validate');
  }
  if (!postgresBackupIsEmptyCustomCatalog(';\n')) {
    throw new Error('semicolon-only pg_restore list should be empty custom catalog');
  }
  if (postgresBackupIsEmptyCustomCatalog('; 1 2 TABLE public plans postgres\n')) {
    throw new Error('TABLE list must not be treated as empty catalog');
  }
  if (!homepageIsLegacyStarter(LEGACY_HOME)) {
    throw new Error('legacy homepage fixture should be detected');
  }
  if (homepageIsLegacyStarter(MODERN_HOME)) {
    throw new Error('modern homepage fixture should not be detected as legacy');
  }
  if (!MODERN_HOME.includes('_next/static')) {
    throw new Error('modern fixture should include _next/static');
  }
  const remoteDeploy = readFileSync(join(scriptDir, 'remote-deploy.sh'), 'utf8');
  if (!remoteDeployScriptOrderIsValid(remoteDeploy)) {
    throw new Error('remote-deploy.sh must generate Prisma client before API build');
  }
}

function resolveBashExecutable() {
  const candidates = [
    process.env.BASH_PATH,
    process.platform === 'win32' ? 'C:\\Program Files\\Git\\bin\\bash.exe' : null,
    'bash',
  ].filter(Boolean);
  for (const candidate of candidates) {
    if ((candidate.includes('/') || candidate.includes('\\')) && !existsSync(candidate)) {
      continue;
    }
    const probe = spawnSync(candidate, ['--version'], { encoding: 'utf8' });
    if (probe.status === 0) {
      return candidate;
    }
  }
  return null;
}

const gitEnv = {
  ...process.env,
  GIT_TERMINAL_PROMPT: '0',
  GCM_INTERACTIVE: 'Never',
};

function runGit(cwd, args) {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8', env: gitEnv });
  if (result.status !== 0) {
    throw new Error(`git ${args.join(' ')} failed: ${result.stderr || result.stdout}`);
  }
  return (result.stdout || '').trim();
}

function healthJson(commit) {
  return JSON.stringify({
    status: 'ok',
    service: 'api',
    timestamp: new Date().toISOString(),
    version: '0.0.0-ci',
    commit,
  });
}

function startFixtureServer(commit, homeHtml) {
  return new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      const url = req.url ?? '/';
      if (url === '/health' || url === '/api/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(healthJson(commit));
        return;
      }
      if (url === '/pricing') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<!DOCTYPE html><html><body>pricing</body></html>');
        return;
      }
      if (url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(homeHtml);
        return;
      }
      res.writeHead(404);
      res.end('not found');
    });
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({ server, origin: `http://127.0.0.1:${port}` });
    });
    server.on('error', reject);
  });
}

function runVerifyDeploy(bashExecutable, bashAppRoot, sha, origin, ciEnvFile) {
  return new Promise((resolve, reject) => {
    const child = spawn(bashExecutable, [verifyScript], {
      env: {
        ...process.env,
        ...gitEnv,
        TAKIIA_CI_ENV_FILE: toBashPath(ciEnvFile),
        TAKIIA_APP_ROOT: bashAppRoot,
        TAKIIA_EXPECTED_SHA: sha,
        TAKIIA_API_VERIFY_ORIGIN: origin,
        TAKIIA_WEB_VERIFY_ORIGIN: origin,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    child.on('error', reject);
    child.on('close', (code, signal) => {
      resolve({ status: code, signal, stdout, stderr });
    });
  });
}

async function withFixture(bashExecutable, homeHtml, expectSuccess) {
  const appRoot = join(
    scriptDir,
    `.ci-verify-deploy-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  );
  mkdirSync(appRoot, { recursive: true });
  runGit(appRoot, ['init', '-b', 'main']);
  runGit(appRoot, ['config', 'safe.directory', appRoot]);
  runGit(appRoot, ['config', 'user.email', 'ci@takiia.local']);
  runGit(appRoot, ['config', 'user.name', 'Takiia CI']);
  runGit(appRoot, ['commit', '--allow-empty', '-m', 'ci fixture']);
  const sha = runGit(appRoot, ['rev-parse', 'HEAD']);
  writeFileSync(
    join(appRoot, '.deploy-metadata.json'),
    `${JSON.stringify({ commit: sha, deployedAt: new Date().toISOString() })}\n`,
    'utf8',
  );

  const { server, origin } = await startFixtureServer(sha, homeHtml);
  const bashAppRoot = toBashPath(appRoot);
  const ciEnvFile = join(appRoot, '.verify-deploy.ci.env');
  writeFileSync(
    ciEnvFile,
    [
      `TAKIIA_APP_ROOT=${bashAppRoot}`,
      `TAKIIA_EXPECTED_SHA=${sha}`,
      `TAKIIA_API_VERIFY_ORIGIN=${origin}`,
      `TAKIIA_WEB_VERIFY_ORIGIN=${origin}`,
    ].join('\n') + '\n',
    'utf8',
  );
  try {
    const result = await runVerifyDeploy(bashExecutable, bashAppRoot, sha, origin, ciEnvFile);
    const ok = result.status === 0;
    if (expectSuccess && !ok) {
      console.error(
        `::error::verify-deploy integration (expect success) exit=${result.status} signal=${result.signal ?? 'none'}`,
      );
      if (result.stdout) {
        console.error(result.stdout);
      }
      if (result.stderr) {
        console.error(result.stderr);
      }
      throw new Error(
        `expected verify-deploy success, got exit ${result.status} signal ${result.signal ?? 'none'}`,
      );
    }
    if (!expectSuccess && ok) {
      throw new Error('expected verify-deploy failure for legacy homepage, but it passed');
    }
  } finally {
    await new Promise((resolve) => {
      server.close(() => resolve());
    });
    try {
      rmSync(appRoot, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
    } catch {
      // Best-effort temp cleanup.
    }
  }
}

runUnitTests();

const bashExecutable = resolveBashExecutable();
const runBashIntegration =
  bashExecutable &&
  (process.platform === 'linux' || process.env.FORCE_VERIFY_DEPLOY_INTEGRATION === '1');

if (runBashIntegration) {
  await withFixture(bashExecutable, MODERN_HOME, true);
  await withFixture(bashExecutable, LEGACY_HOME, false);
  console.log('verify-deploy unit + bash integration tests passed');
} else {
  console.log(
    `verify-deploy unit tests passed (bash integration skipped on platform=${process.platform})`,
  );
}
