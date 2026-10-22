import path from 'node:path';

/**
 * Resolves UPLOAD_DIR relative to the API process cwd (PM2 exec cwd on production).
 * Uses POSIX paths so Linux deploy paths are stable regardless of dev OS.
 */
export function resolveUploadDir(uploadDir: string, processCwd: string): string {
  const posix = path.posix;
  if (uploadDir.startsWith('/') || /^[A-Za-z]:[\\/]/.test(uploadDir)) {
    return posix.normalize(uploadDir.replace(/\\/g, '/'));
  }
  const cwd = processCwd.replace(/\\/g, '/');
  return posix.normalize(posix.join(cwd, uploadDir));
}
