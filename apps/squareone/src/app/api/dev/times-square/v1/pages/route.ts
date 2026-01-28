/**
 * Mock Times Square API endpoint: /times-square/v1/pages (App Router version)
 * This endpoint lists available pages.
 */

import { NextResponse } from 'next/server';

import { loadAppConfig } from '@/lib/config/loader';

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
    console.error(
      'Failed to load configuration in Times Square pages API:',
      error
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
