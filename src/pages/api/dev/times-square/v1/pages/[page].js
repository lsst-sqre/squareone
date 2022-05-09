/*
 * Mock Times Square API endpoint: /times-square/v1/pages/:page
 */
import getConfig from 'next/config';

export default function handler(req, res) {
  const { page } = req.query;
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
