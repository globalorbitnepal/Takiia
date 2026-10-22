/** Mirrors legacy starter detection in verify-deploy.sh (keep in sync). */
export function homepageIsLegacyStarter(body) {
  if (body.includes('Starter web app for messaging and calling')) {
    return true;
  }
  if (body.includes('aria-label="Local development"')) {
    return true;
  }
  if (body.includes('http://localhost:4000')) {
    return true;
  }
  if (body.includes('Messaging and voice/video calling')) {
    return true;
  }
  return false;
}
