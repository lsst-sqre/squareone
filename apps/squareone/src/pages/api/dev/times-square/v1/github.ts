/*
 * Mock Times Square API endpoint: /times-square/v1/github
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { loadAppConfig } from '../../../../../lib/config/loader';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const appConfig = await loadAppConfig();
    const { timesSquareUrl } = appConfig;

    const content = {
      contents: [
        {
          node_type: 'owner',
          title: 'lsst-sqre',
          path: 'lsst-sqre',
          contents: [
            {
              node_type: 'repo',
              title: 'times-square-demo',
              path: 'lsst-sqre/times-square-demo',
              contents: [
                {
                  node_type: 'page',
                  title: 'Demo',
                  path: 'lsst-sqre/times-square-demo/demo',
                },
                {
                  node_type: 'directory',
                  title: 'matplotlib',
                  path: 'lsst-sqre/times-square-demo/matplotlib',
                  contents: [
                    {
                      node_type: 'page',
                      title: 'Gaussian 2D',
                      path: 'lsst-sqre/times-square-demo/matplotlib/gaussian2d',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(content));
  } catch (error) {
    console.error(
      'Failed to load configuration in Times Square github API:',
      error
    );
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
}
