// Log-out endpoint for user testing

import { setDevState } from '../../../lib/mocks/devstate';

export default function handler(req, res) {
  if (req.method === 'POST') {
    setDevState({ loggedIn: false });
    res.status(200).end('Complete');
  } else {
    res.status(405).end('Not logged in');
  }
}
