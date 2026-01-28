/**
 * Mock Times Square API endpoint: /times-square/api/v1/pages/:page/htmlstatus
 * (App Router version)
 */

import { NextResponse } from 'next/server';

import { loadAppConfig } from '@/lib/config/loader';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ page: string }> }
) {
  try {
    const { page } = await params;
    const url = new URL(request.url);
    const a = url.searchParams.get('a') ?? '1';

    const appConfig = await loadAppConfig();
    const { timesSquareUrl } = appConfig;

    const pageBaseUrl = `${timesSquareUrl}/v1/pages/${page}`;

    const content = {
      available: a !== '2', // magic value to toggle status modes
      html_url: `${pageBaseUrl}/html?a=${a}`,
      html_hash: a !== '2' ? '12345' : null,
    };

    console.log(content);
    console.log('Pinged status');

    return NextResponse.json(content);
  } catch (error) {
    console.error(
      'Failed to load configuration in Times Square htmlstatus API:',
      error
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
