/**
 * Tests for Gafaelfawr mutation configurations.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createServiceTokenMutationConfig } from './mutation-options';
import { gafaelfawrKeys } from './query-keys';

describe('createServiceTokenMutationConfig', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('builds a service-token request and posts it to the admin endpoint', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ token: 'gt-bot-token' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const expires = new Date('2024-01-01T00:00:00Z');
    const result = await createServiceTokenMutationConfig.mutationFn({
      username: 'bot-example',
      scopes: ['read:tap'],
      expires,
      csrfToken: 'csrf-token',
      baseUrl: '/auth/api/v1',
    });

    expect(result.token).toBe('gt-bot-token');

    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe('/auth/api/v1/tokens');
    expect(init.method).toBe('POST');
    expect(init.headers['x-csrf-token']).toBe('csrf-token');

    const body = JSON.parse(init.body);
    expect(body).toEqual({
      username: 'bot-example',
      token_type: 'service',
      scopes: ['read:tap'],
      expires: Math.floor(expires.getTime() / 1000),
    });
    // Gafaelfawr's service path rejects a token_name; it must not be sent.
    expect(body).not.toHaveProperty('token_name');
  });

  it('includes optional metadata when supplied', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ token: 'gt-bot-token' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await createServiceTokenMutationConfig.mutationFn({
      username: 'bot-example',
      scopes: [],
      expires: null,
      name: 'Example Bot',
      email: 'bot@example.com',
      uid: 90000,
      gid: 90000,
      groups: [{ name: 'bots', id: 90000 }],
      csrfToken: 'csrf-token',
      baseUrl: '/auth/api/v1',
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.name).toBe('Example Bot');
    expect(body.email).toBe('bot@example.com');
    expect(body.uid).toBe(90000);
    expect(body.gid).toBe(90000);
    expect(body.groups).toEqual([{ name: 'bots', id: 90000 }]);
    expect(body.expires).toBeNull();
  });

  it('omits optional metadata when not supplied', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ token: 'gt-bot-token' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await createServiceTokenMutationConfig.mutationFn({
      username: 'bot-example',
      scopes: [],
      expires: null,
      csrfToken: 'csrf-token',
      baseUrl: '/auth/api/v1',
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body).not.toHaveProperty('name');
    expect(body).not.toHaveProperty('email');
    expect(body).not.toHaveProperty('uid');
    expect(body).not.toHaveProperty('gid');
    expect(body).not.toHaveProperty('groups');
  });

  it('invalidates the bot user token list on success', () => {
    expect(
      createServiceTokenMutationConfig.getInvalidateKeys('bot-example')
    ).toEqual([gafaelfawrKeys.tokensList('bot-example')]);
  });
});
