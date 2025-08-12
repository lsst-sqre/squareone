/*
 * Mock Times Square API endpoint: /times-square/v1/pages/[page]/html
 */

import type { NextApiRequest, NextApiResponse } from 'next';

const htmlContent = `
<!doctype html>
<html class="no-js" lang="">

<head>
  <meta charset="utf-8">
  <title>Test document</title>
</head>

<body>
  <h1>Test content</h1>
  <p>Hello world</p>
</body>
</html>
`;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { page } = req.query;
  console.log(req.url);

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.end(htmlContent);
}
