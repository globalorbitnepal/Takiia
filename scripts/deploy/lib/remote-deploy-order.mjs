/**
 * Validates remote-deploy.sh step order without executing deploy (CI unit check).
 */

/**
 * @param {string} scriptText contents of remote-deploy.sh
 */
export function remoteDeployScriptOrderIsValid(scriptText) {
  const npmCi = scriptText.indexOf('npm ci');
  const generate = scriptText.indexOf('db:generate');
  const migrateDeploy = scriptText.indexOf('db:migrate:deploy');
  const buildBlock = scriptText.indexOf('Building (must succeed before PM2 start/reload)');
  const metadata = scriptText.indexOf('takiia_write_deploy_metadata');
  const pm2 = scriptText.indexOf('pm2_takiia_start_or_reload_both');

  const required = [npmCi, generate, buildBlock, metadata, pm2];
  if (required.some((idx) => idx < 0)) {
    return false;
  }

  if (!(npmCi < generate && generate < buildBlock && buildBlock < metadata && metadata < pm2)) {
    return false;
  }

  if (migrateDeploy >= 0 && !(generate < migrateDeploy && migrateDeploy < buildBlock)) {
    return false;
  }

  const buildApiBeforeGenerate = /npm run build --workspace @takiia\/api[\s\S]*db:generate/.test(scriptText);
  if (buildApiBeforeGenerate) {
    return false;
  }

  return true;
}
