import { mockDiscovery } from '@lsst-sqre/repertoire-client';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Use absolute URLs at the dev server's own origin so the values pass the
  // repertoire-client URL schema (z.string().url()) AND are fetchable from
  // server components. Pathnames still match the next.config.js rewrites that
  // route them to the local mock handlers.
  const origin = new URL(request.url).origin;
  const devDiscovery = structuredClone(mockDiscovery);

  const internal = devDiscovery.services.internal;
  if (internal.gafaelfawr) {
    internal.gafaelfawr.url = `${origin}/auth`;
    if (internal.gafaelfawr.openapi) {
      internal.gafaelfawr.openapi = `${origin}/auth/openapi.json`;
    }
    if (internal.gafaelfawr.versions?.v1) {
      internal.gafaelfawr.versions.v1.url = `${origin}/auth/api/v1`;
    }
  }
  if (internal.semaphore) {
    internal.semaphore.url = `${origin}/semaphore`;
  }
  if (internal['times-square']) {
    internal['times-square'].url = `${origin}/times-square/api`;
    if (internal['times-square'].openapi) {
      internal['times-square'].openapi =
        `${origin}/times-square/api/openapi.json`;
    }
    if (internal['times-square'].versions?.v1) {
      internal['times-square'].versions.v1.url =
        `${origin}/times-square/api/v1`;
    }
  }

  return NextResponse.json(devDiscovery);
}
