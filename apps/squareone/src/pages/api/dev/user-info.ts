// Mock of Gafaelfawr user-info endpoint

import type { NextApiRequest, NextApiResponse } from 'next';
import { getDevState } from '../../../lib/mocks/devstate';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { loggedIn, username, name, uid } = getDevState();
  if (!loggedIn) {
    res.status(401).end('Not logged in');
  } else {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ username, name, uid }));
  }
}
