/*
 * Mock Times Square API for a PR preview page:
 * /times-square/v1/github-pr/:owner/:repo/:commit/:slug
 */

import getConfig from 'next/config';

export default function handler(req, res) {
  const { tsSlug } = req.query;
  const page = 'demo';
  const { publicRuntimeConfig } = getConfig();
  const { timesSquareUrl } = publicRuntimeConfig;
  const pageBaseUrl = `${timesSquareUrl}/v1/pages/${page}`;

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
