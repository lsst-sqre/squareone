import { TokenInfoSchema } from '@lsst-sqre/gafaelfawr-client';
import { afterEach, describe, expect, it } from 'vitest';

import { getDevState, setDevState } from '@/lib/mocks/devstate';
import {
  getDevUserTokens,
  resetDevUserTokens,
} from '@/lib/mocks/userTokensStore';

import { DELETE, GET } from './route.dev';

const initialState = { ...getDevState() };
afterEach(() => {
  setDevState(initialState);
  resetDevUserTokens();
});

function makeParams(username: string, key: string) {
  return { params: Promise.resolve({ username, key }) };
}

describe('GET /api/dev/gafaelfawr/v1/users/:username/tokens/:key', () => {
  it('returns 401 when logged out', async () => {
    setDevState({ loggedIn: false });
    const [first] = getDevUserTokens('vera');
    const response = await GET(
      new Request('http://localhost'),
      makeParams('vera', first.token)
    );
    expect(response.status).toBe(401);
  });

  it('returns a schema-valid token for a known key', async () => {
    setDevState({ loggedIn: true, username: 'vera' });
    const [first] = getDevUserTokens('vera');

    const response = await GET(
      new Request('http://localhost'),
      makeParams('vera', first.token)
    );
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(() => TokenInfoSchema.parse(body)).not.toThrow();
    expect(body.token).toBe(first.token);
  });

  it('returns 404 for an unknown key', async () => {
    setDevState({ loggedIn: true, username: 'vera' });
    const response = await GET(
      new Request('http://localhost'),
      makeParams('vera', 'gtdoesnotexist1234567')
    );
    expect(response.status).toBe(404);
  });

  it('returns 403 when requesting another user’s token', async () => {
    setDevState({ loggedIn: true, username: 'vera' });
    const response = await GET(
      new Request('http://localhost'),
      makeParams('someone-else', 'gtsession1234567890abc')
    );
    expect(response.status).toBe(403);
  });
});

describe('DELETE /api/dev/gafaelfawr/v1/users/:username/tokens/:key', () => {
  it('revokes a known token and returns 204', async () => {
    setDevState({ loggedIn: true, username: 'vera' });
    const [first] = getDevUserTokens('vera');

    const response = await DELETE(
      new Request('http://localhost', { method: 'DELETE' }),
      makeParams('vera', first.token)
    );
    expect(response.status).toBe(204);

    // The token is gone from the store.
    expect(
      getDevUserTokens('vera').some((token) => token.token === first.token)
    ).toBe(false);
  });

  it('returns 404 when revoking an unknown token', async () => {
    setDevState({ loggedIn: true, username: 'vera' });
    const response = await DELETE(
      new Request('http://localhost', { method: 'DELETE' }),
      makeParams('vera', 'gtdoesnotexist1234567')
    );
    expect(response.status).toBe(404);
  });

  it('returns 403 when revoking another user’s token', async () => {
    setDevState({ loggedIn: true, username: 'vera' });
    const response = await DELETE(
      new Request('http://localhost', { method: 'DELETE' }),
      makeParams('someone-else', 'gtsession1234567890abc')
    );
    expect(response.status).toBe(403);
  });
});
