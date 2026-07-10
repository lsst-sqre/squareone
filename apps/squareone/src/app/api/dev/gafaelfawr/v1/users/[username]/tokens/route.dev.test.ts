import { TokenInfoSchema } from '@lsst-sqre/gafaelfawr-client';
import { afterEach, describe, expect, it } from 'vitest';

import { getDevState, setDevState } from '@/lib/mocks/devstate';
import { resetDevUserTokens } from '@/lib/mocks/userTokensStore';

import { GET, POST } from './route.dev';

const initialState = { ...getDevState() };
afterEach(() => {
  setDevState(initialState);
  resetDevUserTokens();
});

function makeParams(username: string) {
  return { params: Promise.resolve({ username }) };
}

describe('GET /api/dev/gafaelfawr/v1/users/:username/tokens', () => {
  it('returns 401 when logged out', async () => {
    setDevState({ loggedIn: false });
    const response = await GET(
      new Request('http://localhost'),
      makeParams('vera')
    );
    expect(response.status).toBe(401);
  });

  it('returns a schema-valid array of the user tokens when logged in', async () => {
    setDevState({ loggedIn: true, username: 'vera' });

    const response = await GET(
      new Request('http://localhost'),
      makeParams('vera')
    );
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
    for (const token of body) {
      expect(() => TokenInfoSchema.parse(token)).not.toThrow();
      expect(token.username).toBe('vera');
    }
  });

  it('decodes URL-encoded usernames', async () => {
    setDevState({ loggedIn: true });
    const response = await GET(
      new Request('http://localhost'),
      makeParams(encodeURIComponent('bot-svc'))
    );
    const body = await response.json();
    expect(
      body.every((token: { username: string }) => token.username === 'bot-svc')
    ).toBe(true);
  });
});

describe('POST /api/dev/gafaelfawr/v1/users/:username/tokens', () => {
  it('returns 401 when logged out', async () => {
    setDevState({ loggedIn: false });
    const request = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ token_name: 'x', scopes: [] }),
    });
    const response = await POST(request, makeParams('vera'));
    expect(response.status).toBe(401);
  });

  it('creates a token and returns a one-time full token string', async () => {
    setDevState({ loggedIn: true, username: 'vera' });

    const request = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({
        token_name: 'My new token',
        scopes: ['read:tap'],
        expires: null,
      }),
    });
    const response = await POST(request, makeParams('vera'));
    expect(response.status).toBe(201);

    const body = await response.json();
    expect(typeof body.token).toBe('string');
    expect(body.token.startsWith('gt-')).toBe(true);

    // The created token now shows up in the list.
    const listResponse = await GET(
      new Request('http://localhost'),
      makeParams('vera')
    );
    const list = await listResponse.json();
    expect(
      list.some(
        (token: { token_name: string }) => token.token_name === 'My new token'
      )
    ).toBe(true);
  });
});
