/*
 * Mock Times Square GitHub PR contents API endpoint:
 * /times-square/v1/github-pr/:owner/:repo/:commit
 */

import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  // const { owner, repo, commit, tsSlug } = req.query;

  const data = {
    contents: [
      {
        node_type: 'owner',
        title: 'lsst-sqre',
        path: 'lsst-sqre',
        contents: [
          {
            node_type: 'page',
            title: 'Demo',
            path: 'demo',
          },
          {
            node_type: 'directory',
            title: 'matplotlib',
            path: 'matplotlib',
            contents: [
              {
                node_type: 'page',
                title: 'Gaussian 2D',
                path: 'matplotlib/gaussian2d',
              },
            ],
          },
        ],
      },
    ],
    owner: 'lsst-sqre',
    repo: 'times-square-demo',
    commit: 'e35e1d5c485531ba9e99081c52dbdc5579e00556',
    yaml_check: {
      status: 'completed',
      conclusion: 'success',
      external_id: 'times-square/yaml-check',
      head_sha: 'e35e1d5c485531ba9e99081c52dbdc5579e00556',
      name: 'YAML config validation',
      html_url:
        'https://github.com/lsst-sqre/times-square-demo/runs/7186782973',
      report_title: 'YAML config validation',
      report_summary: {
        gfm: 'Everything looks good ✅ (checked times-square.yaml and 2 notebook sidecar files)',
        html: '<p>Everything looks good ✅ (checked times-square.yaml and 2 notebook sidecar files)</p>\n',
      },
      report_text: {
        gfm: '| File | Status |\n | --- | :-: |\n| times-square.yaml | ✅ |\n| demo.yaml | ✅ |\n| matplotlib/gaussian2d.yaml | ✅ |\n',
        html: '<table>\n<thead>\n<tr>\n<th>File</th>\n<th style="text-align:center">Status</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>times-square.yaml</td>\n<td style="text-align:center">✅</td>\n</tr>\n<tr>\n<td>demo.yaml</td>\n<td style="text-align:center">✅</td>\n</tr>\n<tr>\n<td>matplotlib/gaussian2d.yaml</td>\n<td style="text-align:center">✅</td>\n</tr>\n</tbody>\n</table>\n',
      },
    },
    nbexec_check: {
      status: 'completed',
      conclusion: 'success',
      external_id: 'times-square/nbexec',
      head_sha: 'e35e1d5c485531ba9e99081c52dbdc5579e00556',
      name: 'Notebook execution',
      html_url:
        'https://github.com/lsst-sqre/times-square-demo/runs/7186783079',
      report_title: 'Notebook execution',
      report_summary: {
        gfm: 'Notebooks ran without issue ✅ (checked 2 notebooks)',
        html: '<p>Notebooks ran without issue ✅ (checked 2 notebooks)</p>\n',
      },
      report_text: {
        gfm: '| Notebook | Status |\n | --- | :-: |\n| demo.ipynb | ✅ |\n| matplotlib/gaussian2d.ipynb | ✅ |\n',
        html: '<table>\n<thead>\n<tr>\n<th>Notebook</th>\n<th style="text-align:center">Status</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>demo.ipynb</td>\n<td style="text-align:center">✅</td>\n</tr>\n<tr>\n<td>matplotlib/gaussian2d.ipynb</td>\n<td style="text-align:center">✅</td>\n</tr>\n</tbody>\n</table>\n',
      },
    },
    pull_requests: [
      {
        number: 15,
        title: 'DM-35150: Add a description to Gaussian 2D',
        conversation_url:
          'https://github.com/lsst-sqre/times-square-demo/pull/15',
        contributor: {
          username: 'jonathansick',
          html_url: 'https://github.com/jonathansick',
          avatar_url: 'https://avatars.githubusercontent.com/u/349384?v=4',
        },
        state: 'open',
      },
    ],
  };

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}
