/**
 * Mock Times Square API endpoint: /times-square/v1/github (App Router version)
 *
 * The response mixes a clean tree (lsst-sqre) with the raw
 * duplicate-directory shape emitted by Times Square servers predating
 * lsst-sqre/times-square#140 (lsst-so, via
 * `mockGitHubContentsDuplicateDirectories`), so the client-side
 * `normalizeGitHubContents()` pass is exercised in development.
 */

import {
  type GitHubContentsRoot,
  mockGitHubContentsDuplicateDirectories,
} from '@lsst-sqre/times-square-client';
import { NextResponse } from 'next/server';

export async function GET() {
  const content: GitHubContentsRoot = {
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
                contents: [],
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
                    contents: [],
                  },
                ],
              },
              {
                node_type: 'directory',
                title: 'nightly',
                path: 'lsst-sqre/times-square-demo/nightly',
                contents: [
                  {
                    node_type: 'directory',
                    title: 'auxtel',
                    path: 'lsst-sqre/times-square-demo/nightly/auxtel',
                    contents: [
                      {
                        node_type: 'page',
                        title: 'AuxTel Report',
                        path: 'lsst-sqre/times-square-demo/nightly/auxtel/report',
                        contents: [],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      // Raw duplicate-directory bug shape (pre lsst-sqre/times-square#140).
      ...mockGitHubContentsDuplicateDirectories.contents,
    ],
  };

  return NextResponse.json(content);
}
