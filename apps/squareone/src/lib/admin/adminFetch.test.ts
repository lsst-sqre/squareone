import { describe, expect, test, vi } from 'vitest';

import { adminFetch } from './adminFetch';

const ADMIN_PATH = '/admin/sentry/emit-log';

/** Read the headers of a recorded `fetch` call, whatever form they took. */
function headersOf(init: RequestInit | undefined): Headers {
  return new Headers(init?.headers);
}

// Spies are not restored inline: the unit vitest project sets
// `restoreMocks: true` (see vitest.config.ts), guarded by
// `src/tests/restoreMocks.test.ts`.
describe('adminFetch', () => {
  test('flags the request as an XHR so an expired session fails as a 403', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(null, { status: 200 }));

    await adminFetch(ADMIN_PATH, { method: 'POST' });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [input, init] = fetchMock.mock.calls[0];
    expect(input).toBe(ADMIN_PATH);
    expect(init?.method).toBe('POST');
    // Without this header the /admin ingress answers an expired session with a
    // 302 toward CILogon, which `fetch` follows cross-origin and reports as an
    // opaque CORS failure rather than as the auth failure it is.
    expect(headersOf(init).get('X-Requested-With')).toBe('XMLHttpRequest');
  });

  test("keeps the caller's own headers alongside the XHR flag", async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(null, { status: 200 }));

    await adminFetch(ADMIN_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const headers = headersOf(fetchMock.mock.calls[0][1]);
    expect(headers.get('Content-Type')).toBe('application/json');
    expect(headers.get('X-Requested-With')).toBe('XMLHttpRequest');
  });

  test('defaults to a GET, like fetch, when the caller supplies no init', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(null, { status: 200 }));

    await adminFetch(ADMIN_PATH);

    const [, init] = fetchMock.mock.calls[0];
    expect(init?.method).toBeUndefined();
    expect(headersOf(init).get('X-Requested-With')).toBe('XMLHttpRequest');
  });

  test('hands back the underlying fetch promise rather than settling it early', async () => {
    let resolveFetch: (response: Response) => void = () => {};
    vi.spyOn(globalThis, 'fetch').mockImplementation(
      () =>
        new Promise<Response>((resolve) => {
          resolveFetch = resolve;
        })
    );

    // Callers render an in-flight state for exactly as long as this promise is
    // pending, so the helper must not interpose a settled promise of its own.
    const pending = adminFetch(ADMIN_PATH, { method: 'POST' });
    const response = new Response(null, { status: 200 });
    resolveFetch(response);

    await expect(pending).resolves.toBe(response);
  });
});
