import { mockUserInfo, UserInfoSchema } from '@lsst-sqre/gafaelfawr-client';
import { afterEach, describe, expect, it } from 'vitest';

import { getDevState, setDevState } from '../../../../lib/mocks/devstate';

import { GET } from './route.dev';

// Snapshot the module-level dev state so each test starts from a known place
// and mutations don't leak across tests.
const initialState = { ...getDevState() };
afterEach(() => {
  setDevState(initialState);
});

function request(): Request {
  return new Request('http://localhost:3000/api/dev/user-info');
}

describe('GET /api/dev/user-info (mock of /auth/api/v1/user-info)', () => {
  it('returns 401 when logged out', async () => {
    setDevState({ loggedIn: false });

    const response = await GET(request());

    expect(response.status).toBe(401);
  });

  it('returns the dev persona with the mock user quotas', async () => {
    setDevState({ loggedIn: true, username: 'vera', name: 'Vera Rubin' });

    const response = await GET(request());
    expect(response.status).toBe(200);

    // Must satisfy the schema so useUserInfo() and the quotas page work.
    const parsed = UserInfoSchema.parse(await response.json());

    expect(parsed.username).toBe('vera');
    expect(parsed.name).toBe('Vera Rubin');
    expect(parsed.quota).toEqual(mockUserInfo.quota);
  });
});
