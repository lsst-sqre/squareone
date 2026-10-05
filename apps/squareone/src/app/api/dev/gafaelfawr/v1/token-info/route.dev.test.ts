import { TokenInfoSchema } from '@lsst-sqre/gafaelfawr-client';
import { afterEach, describe, expect, it } from 'vitest';

import { DEV_DELEGATED_TOKEN } from '@/lib/mocks/devDelegatedToken';
import { getDevState, setDevState } from '@/lib/mocks/devstate';

import { GET } from './route.dev';

const initialState = { ...getDevState() };
afterEach(() => {
  setDevState(initialState);
});

function requestWithBearer(token: string) {
  return new Request('http://localhost', {
    headers: { authorization: `Bearer ${token}` },
  });
}

describe('GET /api/dev/gafaelfawr/v1/token-info', () => {
  it("describes the dev persona's delegated token for the dev bearer token", async () => {
    setDevState({
      loggedIn: true,
      username: 'vera',
      scopes: ['exec:admin', 'exec:notebook'],
    });

    const response = await GET(requestWithBearer(DEV_DELEGATED_TOKEN));

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(() => TokenInfoSchema.parse(body)).not.toThrow();
    expect(body).toMatchObject({
      username: 'vera',
      token_type: 'internal',
      service: 'squareone',
      scopes: ['exec:admin', 'exec:notebook'],
    });
  });

  it('answers the session cookie like real Gafaelfawr when logged in', async () => {
    setDevState({ loggedIn: true, username: 'vera' });

    const response = await GET(new Request('http://localhost'));

    expect(response.status).toBe(200);
  });

  it('returns 401 for an unknown bearer token', async () => {
    setDevState({ loggedIn: true });

    const response = await GET(requestWithBearer('gt-not-the-dev-token'));

    expect(response.status).toBe(401);
  });

  it('returns 401 when logged out and no bearer token is sent', async () => {
    setDevState({ loggedIn: false });

    const response = await GET(new Request('http://localhost'));

    expect(response.status).toBe(401);
  });
});
