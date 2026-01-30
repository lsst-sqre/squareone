/**
 * Log-in endpoint for user testing (App Router version)
 * POST /api/dev/login
 * Optionally set username and name in the JSON post body.
 */

import { setDevState } from '@/lib/mocks/devstate';

export async function POST(request: Request) {
  const body = await request.json();
  setDevState({ ...body, loggedIn: true });
  return new Response('Logged in', { status: 200 });
}
