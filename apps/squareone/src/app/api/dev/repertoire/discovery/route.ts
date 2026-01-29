import { mockDiscovery } from '@lsst-sqre/repertoire-client';
import { NextResponse } from 'next/server';

export async function GET() {
  // Override internal service URLs to use relative paths so that
  // Next.js rewrites in next.config.js route them to local mock handlers.
  const devDiscovery = structuredClone(mockDiscovery);

  const internal = devDiscovery.services.internal;
  if (internal.gafaelfawr) {
    internal.gafaelfawr.url = '/auth';
    if (internal.gafaelfawr.openapi) {
      internal.gafaelfawr.openapi = '/auth/openapi.json';
    }
    if (internal.gafaelfawr.versions?.v1) {
      internal.gafaelfawr.versions.v1.url = '/auth/api/v1';
    }
  }
  if (internal.semaphore) {
    internal.semaphore.url = '/semaphore';
  }
  if (internal['times-square']) {
    internal['times-square'].url = '/times-square/api';
    if (internal['times-square'].openapi) {
      internal['times-square'].openapi = '/times-square/api/openapi.json';
    }
    if (internal['times-square'].versions?.v1) {
      internal['times-square'].versions.v1.url = '/times-square/api/v1';
    }
  }

  return NextResponse.json(devDiscovery);
}
