/**
 * Mock Times Square API endpoint: /times-square/v1/github (App Router version)
 */

import { NextResponse } from 'next/server';

export async function GET() {
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

  return NextResponse.json(content);
}
