/**
 * Mock Times Square API endpoint: /times-square/v1/pages/:page (App Router version)
 */

import type { Page } from '@lsst-sqre/times-square-client';
import { NextResponse } from 'next/server';

import { loadAppConfig } from '@/lib/config/loader';
import { createRouteLogger } from '@/lib/logger';

const log = createRouteLogger('times-square/pages/[page]');

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

    // Shape must conform to the PageSchema Zod schema in
    // @lsst-sqre/times-square-client (packages/times-square-client/src/schemas.ts).
    const content: Page = {
      name: page,
      title: `Title for ${page}`,
      description: {
        gfm: 'This is the description.',
        html: '<p>This is the description.</p>',
      },
      date_added: '2024-01-15T10:00:00Z',
      authors: [],
      tags: [],
      uploader_username: 'someuser',
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
      github: null,
    };

    return NextResponse.json(content);
  } catch (error) {
    log.error({ err: error }, 'Failed to load configuration');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
