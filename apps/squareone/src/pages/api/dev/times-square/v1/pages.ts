/*
 * Mock Times Square API endpoint: /times-square/v1/pages
 *
 * This endpoint lists available pages.
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { loadAppConfig } from '../../../../../lib/config/loader';

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
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

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(content));
  } catch (error) {
    console.error(
      'Failed to load configuration in Times Square pages API:',
      error
    );
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
}
