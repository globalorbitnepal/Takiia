import { createHealthPayload } from '@takiia/shared';

export async function GET() {
  return Response.json(createHealthPayload('web', process.env.npm_package_version ?? '0.1.0'));
}
