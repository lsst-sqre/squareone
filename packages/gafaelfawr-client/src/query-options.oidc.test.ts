/**
 * Tests for the OpenID Connect query options.
 *
 * Kept apart from `query-options.test.ts` for the same reason as
 * `client.oidc.test.ts`: msw and a global `fetch` stub cannot share a file.
 */
import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { GafaelfawrError, isOidcNotConfiguredError } from './errors';
import { mockOidcClients } from './mock-data';
import { gafaelfawrKeys } from './query-keys';
import {
  oidcClientQueryOptions,
  oidcClientsQueryOptions,
} from './query-options';

const BASE = 'https://gafaelfawr.example.org/auth/api/v1';

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

/** A silent logger so expected failures do not spam the test output. */
const logger = { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() };

describe('oidcClientsQueryOptions', () => {
  it('uses the list query key', () => {
    expect(oidcClientsQueryOptions(BASE).queryKey).toEqual(
      gafaelfawrKeys.oidcClients(BASE)
    );
  });

  it('resolves with the client list', async () => {
    server.use(
      http.get(`${BASE}/oidc-clients`, () => HttpResponse.json(mockOidcClients))
    );

    const opts = oidcClientsQueryOptions(BASE);
    // biome-ignore lint/style/noNonNullAssertion: test assertion
    const clients = await opts.queryFn!({} as never);

    expect(clients).toHaveLength(mockOidcClients.length);
  });

  it('rejects rather than degrading to an empty list when unconfigured', async () => {
    server.use(
      http.get(`${BASE}/oidc-clients`, () =>
        HttpResponse.json(
          { detail: [{ msg: 'not configured', type: 'x' }] },
          {
            status: 404,
          }
        )
      )
    );

    const opts = oidcClientsQueryOptions(BASE, { logger });
    const error = await Promise.resolve(
      // biome-ignore lint/style/noNonNullAssertion: test assertion
      opts.queryFn!({} as never)
    ).catch((err: unknown) => err);

    expect(isOidcNotConfiguredError(error)).toBe(true);
  });

  it('logs but does not report an expected 403', async () => {
    server.use(
      http.get(`${BASE}/oidc-clients`, () =>
        HttpResponse.json(
          { detail: [{ msg: 'denied', type: 'x' }] },
          {
            status: 403,
          }
        )
      )
    );

    const reportError = vi.fn();
    const opts = oidcClientsQueryOptions(BASE, { logger, reportError });
    await Promise.resolve(
      // biome-ignore lint/style/noNonNullAssertion: test assertion
      opts.queryFn!({} as never)
    ).catch(() => undefined);

    expect(reportError).not.toHaveBeenCalled();
  });

  it('reports contract drift to the injected reporter and still rejects', async () => {
    server.use(
      http.get(`${BASE}/oidc-clients`, () =>
        HttpResponse.json([{ client_id: 'incomplete' }])
      )
    );

    const reportError = vi.fn();
    const opts = oidcClientsQueryOptions(BASE, {
      logger,
      reportError,
      context: { site: 'oidc-clients' },
    });
    // biome-ignore lint/style/noNonNullAssertion: test assertion
    await expect(opts.queryFn!({} as never)).rejects.toThrow();

    expect(reportError).toHaveBeenCalledTimes(1);
    expect(reportError.mock.calls[0][1]).toEqual({ site: 'oidc-clients' });
  });

  it('reports a 5xx and still rejects', async () => {
    server.use(
      http.get(`${BASE}/oidc-clients`, () =>
        HttpResponse.text('boom', { status: 503 })
      )
    );

    const reportError = vi.fn();
    const opts = oidcClientsQueryOptions(BASE, { logger, reportError });
    // biome-ignore lint/style/noNonNullAssertion: test assertion
    await expect(opts.queryFn!({} as never)).rejects.toThrow(GafaelfawrError);

    expect(reportError).toHaveBeenCalledTimes(1);
  });

  it('does not retry a client error but does retry a server error', () => {
    const opts = oidcClientsQueryOptions(BASE);
    const retry = opts.retry as (count: number, error: Error) => boolean;

    expect(retry(0, new GafaelfawrError('denied', 403))).toBe(false);
    expect(retry(0, new GafaelfawrError('not configured', 404))).toBe(false);
    expect(retry(0, new GafaelfawrError('boom', 503))).toBe(true);
    expect(retry(0, new TypeError('fetch failed'))).toBe(true);
    expect(retry(3, new TypeError('fetch failed'))).toBe(false);
  });
});

describe('oidcClientQueryOptions', () => {
  it('uses the detail query key', () => {
    expect(oidcClientQueryOptions('abc', BASE).queryKey).toEqual(
      gafaelfawrKeys.oidcClient(BASE, 'abc')
    );
  });

  it('is disabled without a client id', () => {
    expect(oidcClientQueryOptions('', BASE).enabled).toBe(false);
    expect(oidcClientQueryOptions('abc', BASE).enabled).toBe(true);
  });

  it('resolves with the client', async () => {
    server.use(
      http.get(`${BASE}/oidc-clients/:clientId`, () =>
        HttpResponse.json(mockOidcClients[0])
      )
    );

    const opts = oidcClientQueryOptions(mockOidcClients[0].client_id, BASE);
    // biome-ignore lint/style/noNonNullAssertion: test assertion
    const client = await opts.queryFn!({} as never);

    expect(client.client_id).toBe(mockOidcClients[0].client_id);
  });

  it('rejects with a plain 404 for an unknown client', async () => {
    server.use(
      http.get(`${BASE}/oidc-clients/:clientId`, () =>
        HttpResponse.json(
          { detail: [{ msg: 'no such client', type: 'x' }] },
          {
            status: 404,
          }
        )
      )
    );

    const opts = oidcClientQueryOptions('nope', BASE, { logger });
    const error = await Promise.resolve(
      // biome-ignore lint/style/noNonNullAssertion: test assertion
      opts.queryFn!({} as never)
    ).catch((err: unknown) => err);

    expect(isOidcNotConfiguredError(error)).toBe(false);
    expect((error as GafaelfawrError).statusCode).toBe(404);
  });
});
