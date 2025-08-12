/*
 * Mock Times Square API endpoint: /times-square/v1/pages
 *
 * This endpoint lists available pages.
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import getConfig from 'next/config';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { publicRuntimeConfig } = getConfig();
  const { timesSquareUrl } = publicRuntimeConfig;

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
}
