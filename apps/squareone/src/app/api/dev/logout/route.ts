/**
 * Log-out endpoint for user testing (App Router version)
 * POST /api/dev/logout
 */

import { setDevState } from '@/lib/mocks/devstate';

export async function POST() {
  setDevState({ loggedIn: false });
  return new Response('Complete', { status: 200 });
}
