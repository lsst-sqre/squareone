/*
 * Mock Times Square API endpoint: /times-square/v1/github/:slug
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import getConfig from 'next/config';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { tsSlug } = req.query;
  const page =
    Array.isArray(tsSlug) && tsSlug.length > 0
      ? tsSlug[tsSlug.length - 1]
      : 'demo';
  const { publicRuntimeConfig } = getConfig();
  const { timesSquareUrl } = publicRuntimeConfig;
  const pageBaseUrl = `${timesSquareUrl}/v1/pages/${page}`;

  if (page == 'not-found') {
    // simulate a page that doesn't exist in the backend
    res.statusCode = 404;
    res.end();
    return;
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

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(content));
}
