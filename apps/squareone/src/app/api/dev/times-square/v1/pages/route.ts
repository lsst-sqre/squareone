/**
 * Mock Times Square API endpoint: /times-square/v1/pages (App Router version)
 * This endpoint lists available pages.
 */

import { NextResponse } from 'next/server';

import { loadAppConfig } from '@/lib/config/loader';
import { createRouteLogger } from '@/lib/logger';

const log = createRouteLogger('times-square/pages');

export async function GET() {
  try {
    const appConfig = await loadAppConfig();
    const { timesSquareUrl } = appConfig;

    const createPage = (name: string) => {
      const pageBaseUrl = `${timesSquareUrl}/v1/pages/${name}`;
      return {
        name,
        title: name,
        self_url: pageBaseUrl,
      };
    };

    const content = [createPage('mypage'), createPage('anotherpage')];

    return NextResponse.json(content);
  } catch (error) {
    log.error({ err: error }, 'Failed to load configuration');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
