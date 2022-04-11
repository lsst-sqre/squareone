// Mock of Gafaelfawr user-info endpoint

import { getDevState } from '../../../lib/mocks/devstate';

export default function handler(req, res) {
  const { loggedIn, username, name, uid } = getDevState();
  if (!loggedIn) {
    res.status(401).end('Not logged in');
  } else {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ username, name, uid }));
  }
}
