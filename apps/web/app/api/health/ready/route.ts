import { createHealthPayload, readDeployCommitFromAppRoot } from '@takiia/shared';

export async function GET() {
  const commit = readDeployCommitFromAppRoot(process.env.TAKIIA_APP_ROOT ?? process.cwd());
  return Response.json({
    ...createHealthPayload('web', process.env.npm_package_version ?? '0.1.0', commit),
    checks: { listen: 'ok', port: 3034 },
  });
}
