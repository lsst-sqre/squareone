/*
 * Mock Times Square API endpoint: /times-square/v1/github
 */

import getConfig from 'next/config';

export default function handler(req, res) {
  const { publicRuntimeConfig } = getConfig();
  const { timesSquareUrl } = publicRuntimeConfig;

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
}
