/*
 * Mock Times Square API endpoint: /times-square/v1/github/:slug
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { loadAppConfig } from '../../../../../../lib/config/loader';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { tsSlug } = req.query;
    const page =
      Array.isArray(tsSlug) && tsSlug.length > 0
        ? tsSlug[tsSlug.length - 1]
        : 'demo';
    const appConfig = await loadAppConfig();
    const { timesSquareUrl } = appConfig;
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
      github: {
        owner: 'lsst-sqre',
        repository: 'times-square-demo',
        source_path: `${page}.ipynb`,
        sidecar_path: `${page}.yaml`,
      },
    };

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(content));
  } catch (error) {
    console.error(
      'Failed to load configuration in Times Square github slug API:',
      error
    );
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
}
