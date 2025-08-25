/*
 * Mock Times Square API endpoint: /times-square/api/v1/pages/:page/htmlstatus
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { loadAppConfig } from '../../../../../../../lib/config/loader';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { page, a } = req.query;
    const appConfig = await loadAppConfig();
    const { timesSquareUrl } = appConfig;

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
  } catch (error) {
    console.error(
      'Failed to load configuration in Times Square htmlstatus API:',
      error
    );
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
}
