/**
 * Mock Times Square API endpoint: /times-square/v1/github/:slug (App Router version)
 * Updated to include github field for Times Square page data
 * Fixed URLs to use mock API endpoints
 */

import { NextResponse } from 'next/server';

import { loadAppConfig } from '@/lib/config/loader';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ tsSlug: string[] }> }
) {
  try {
    const { tsSlug } = await params;
    const page =
      Array.isArray(tsSlug) && tsSlug.length > 0
        ? tsSlug[tsSlug.length - 1]
        : 'demo';

    const appConfig = await loadAppConfig();
    const { timesSquareUrl } = appConfig;
    const pageBaseUrl = `${timesSquareUrl}/v1/pages/${page}`;

    if (page === 'not-found') {
      // simulate a page that doesn't exist in the backend
      return new Response(null, { status: 404 });
    }

    const content = {
      name: page,
      title: `Title for ${page}`,
      description: '<p>This is the description.</p>',
      self_url: pageBaseUrl,
      source_url: `${pageBaseUrl}/source`,
      rendered_url: `${pageBaseUrl}/rendered`,
      html_url: `${pageBaseUrl}/html`,
      html_status_url: `${pageBaseUrl}/htmlstatus`,
      html_events_url: `${pageBaseUrl}/htmlevents`,
      parameters: {
        a: {
          type: 'number',
          default: 42,
          description: 'A number.',
        },
        b: {
          type: 'string',
          default: 'Hello',
          description: 'A string.',
        },
      },
      github: {
        owner: 'lsst-sqre',
        repository: 'times-square-demo',
        source_path: `${page}.ipynb`,
        sidecar_path: `${page}.yaml`,
      },
    };

    return NextResponse.json(content);
  } catch (error) {
    console.error(
      'Failed to load configuration in Times Square github slug API:',
      error
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
