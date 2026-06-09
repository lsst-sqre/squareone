/**
 * Mock Times Square API endpoint: /times-square/v1/pages/[page]/html (App Router version)
 */

import { createRouteLogger } from '@/lib/logger';

const log = createRouteLogger('times-square/pages/[page]/html');

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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ page: string }> }
) {
  const { page: _page } = await params;
  log.debug({ url: request.url }, 'Serving HTML content');

  return new Response(htmlContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/html',
    },
  });
}
