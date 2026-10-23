#!/usr/bin/env node
/**
 * Production web starter: bind Next.js on 127.0.0.1:3034 and signal PM2 wait_ready
 * only after /api/health responds. Does not touch other PM2 apps.
 */
'use strict';

const http = require('node:http');
const path = require('node:path');
const { spawn } = require('node:child_process');

function argValue(flag, fallback) {
  const idx = process.argv.indexOf(flag);
  if (idx !== -1 && process.argv[idx + 1]) {
    return process.argv[idx + 1];
  }
  return fallback;
}

const appRoot = process.env.TAKIIA_APP_ROOT
  ? path.resolve(process.env.TAKIIA_APP_ROOT)
  : path.resolve(__dirname, '../..');
const webDir = path.join(appRoot, 'apps/web');
const host = argValue('--hostname', process.env.TAKIIA_WEB_HOST || '127.0.0.1');
const port = Number(argValue('--port', process.env.TAKIIA_WEB_PORT || '3034'));

if (!Number.isInteger(port) || port !== 3034) {
  console.error(`[takiia-web] refusing to bind port ${port}; production web must use 3034`);
  process.exit(1);
}
if (host !== '127.0.0.1') {
  console.error(`[takiia-web] refusing host ${host}; must bind 127.0.0.1`);
  process.exit(1);
}

let nextBin;
try {
  nextBin = require.resolve('next/dist/bin/next', { paths: [webDir, appRoot] });
} catch {
  console.error('[takiia-web] next binary not found under apps/web or app root');
  process.exit(1);
}

const child = spawn(process.execPath, [nextBin, 'start', '--hostname', host, '--port', String(port)], {
  cwd: webDir,
  env: { ...process.env, HOSTNAME: host, PORT: String(port) },
  stdio: 'inherit',
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});

let readySent = false;
function ping() {
  if (readySent) {
    return;
  }
  const req = http.get({ host, port, path: '/api/health', timeout: 2000 }, (res) => {
    res.resume();
    if (res.statusCode === 200) {
      readySent = true;
      if (typeof process.send === 'function') {
        process.send('ready');
      }
      return;
    }
    setTimeout(ping, 400);
  });
  req.on('error', () => setTimeout(ping, 400));
  req.on('timeout', () => {
    req.destroy();
    setTimeout(ping, 400);
  });
}

setTimeout(ping, 300);

function stop(signal) {
  if (!child.killed) {
    child.kill(signal);
  }
}

process.on('SIGINT', () => stop('SIGINT'));
process.on('SIGTERM', () => stop('SIGTERM'));
