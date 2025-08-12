// Log-in endpoint for user testing
// POST /api/dev/login
// Optionally set username and name in the JSON post body.

import type { NextApiRequest, NextApiResponse } from 'next';
import { setDevState } from '../../../lib/mocks/devstate';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    setDevState({ ...req.body, loggedIn: true });
    res.status(200).end('Logged in');
  } else {
    res.status(405).end('Not logged in');
  }
}
