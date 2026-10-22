/**
 * PM2 example for production — copy to /srv/apps/takiia/ecosystem.config.cjs
 * Start only these processes (do not touch ambition-holidays, globalorbitnepal, etc.).
 *
 * First start (Takiia only — only apps defined in this file):
 *   pm2 start /srv/apps/takiia/ecosystem.config.cjs --env production
 * Subsequent deploys use scripts/deploy/remote-deploy.sh (per-app reload or --only start).
 * Do not use pm2 restart all, pm2 reload all, pm2 delete all, or pm2 save.
 */
const appRoot = '/srv/apps/takiia';

module.exports = {
  apps: [
    {
      name: 'takiia-api',
      cwd: appRoot,
      script: 'apps/api/dist/index.js',
      instances: 1,
      exec_mode: 'fork',
      env_production: {
        NODE_ENV: 'production',
        HOST: '127.0.0.1',
        PORT: '3033',
        TAKIIA_APP_ROOT: appRoot,
      },
    },
    {
      name: 'takiia-web',
      cwd: appRoot,
      script: 'npm',
      args: 'run start --workspace @takiia/web -- --port 3034 --hostname 127.0.0.1',
      interpreter: 'none',
      instances: 1,
      exec_mode: 'fork',
      env_production: {
        NODE_ENV: 'production',
        TAKIIA_APP_ROOT: appRoot,
      },
    },
  ],
};
