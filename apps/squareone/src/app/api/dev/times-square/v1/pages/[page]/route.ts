/**
 * Mock Times Square API endpoint: /times-square/v1/pages/:page (App Router version)
 */

import { NextResponse } from 'next/server';

import { loadAppConfig } from '@/lib/config/loader';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ page: string }> }
) {
  try {
    const { page } = await params;
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
    };

    return NextResponse.json(content);
  } catch (error) {
    console.error(
      'Failed to load configuration in Times Square page API:',
      error
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
