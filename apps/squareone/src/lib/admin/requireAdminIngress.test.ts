import { afterEach, describe, expect, test, vi } from 'vitest';

import {
  ADMIN_INGRESS_USER_HEADER,
  requireAdminIngress,
} from './requireAdminIngress';

/** A request as the ingress (or something bypassing it) would deliver it. */
function adminRequest(headers: Record<string, string> = {}): Request {
  return new Request('https://data.example.org/admin/sentry/emit-log', {
    method: 'POST',
    headers,
  });
}

describe('requireAdminIngress', () => {
  afterEach(() => {
    // `restoreMocks` tears spies down but not env stubs.
    vi.unstubAllEnvs();
  });

  test('lets a request that came through the ingress proceed', () => {
    vi.stubEnv('NODE_ENV', 'production');

    // Gafaelfawr sets this header on every authorized request it passes to the
    // backend, so its presence is the evidence that the ingress ran.
    expect(
      requireAdminIngress(adminRequest({ [ADMIN_INGRESS_USER_HEADER]: 'rra' }))
    ).toBeNull();
  });

  test('refuses a request that reached the app without the ingress', async () => {
    vi.stubEnv('NODE_ENV', 'production');

    const denied = requireAdminIngress(adminRequest());

    // These handlers do no authorization of their own, so a request that did
    // not cross the ingress has been authorized by nobody at all.
    expect(denied).not.toBeNull();
    expect(denied?.status).toBe(403);
    expect(await denied?.json()).toMatchObject({ error: 'not_behind_ingress' });
  });

  test('fails closed in a runtime it does not recognize', () => {
    // Only the development server is exempt; a guard that stood down for every
    // environment it did not recognize would be off by default in exactly the
    // deployments nobody thought about. (The stub is explicit because Vitest
    // runs Vite in development mode, so this suite's own NODE_ENV is
    // `development`.)
    vi.stubEnv('NODE_ENV', 'test');

    expect(requireAdminIngress(adminRequest())?.status).toBe(403);
  });

  test('stands down on the development server, which has no ingress', () => {
    vi.stubEnv('NODE_ENV', 'development');

    // `pnpm dev` serves /admin with no Gafaelfawr in front of it, so enforcing
    // there would make every admin route handler 403 for every developer.
    expect(requireAdminIngress(adminRequest())).toBeNull();
  });
});
