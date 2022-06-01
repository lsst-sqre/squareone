/*
 * Mock Times Square API endpoint: /times-square/api/v1/pages/:page/htmlstatus
 */
import getConfig from 'next/config';

export default function handler(req, res) {
  const { page, a } = req.query;
  const { publicRuntimeConfig } = getConfig();
  const { timesSquareUrl } = publicRuntimeConfig;

  const pageBaseUrl = `${timesSquareUrl}/v1/pages/${page}`;

  const content = {
    available: a != '2', // magic value to toggle status modes
    html_url: `${pageBaseUrl}/html?a=${a}`,
    html_hash: a != '2' ? '12345' : null,
  };

  console.log(content);

  console.log('Pinged status');

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(content));
}
