import { LoginInfoSchema } from '@lsst-sqre/gafaelfawr-client';
import { afterEach, describe, expect, it } from 'vitest';

import { AVAILABLE_SCOPES } from '../../../../lib/mocks/devScopes';
import { getDevState, setDevState } from '../../../../lib/mocks/devstate';

import { GET } from './route.dev';

// Snapshot the module-level dev state so each test starts from a known place
// and mutations don't leak across tests.
const initialState = { ...getDevState() };
afterEach(() => {
  setDevState(initialState);
});

describe('GET /api/dev/login-info (mock of /auth/api/v1/login)', () => {
  it('returns 401 when logged out', async () => {
    setDevState({ loggedIn: false });

    const response = await GET();

    expect(response.status).toBe(401);
  });

  it('returns a valid LoginInfo with the active scopes when logged in', async () => {
    setDevState({
      loggedIn: true,
      username: 'vera',
      scopes: ['exec:admin', 'read:tap'],
    });

    const response = await GET();
    expect(response.status).toBe(200);

    const body = await response.json();
    // Must satisfy the schema so useLoginInfo() / query.hasScope() work.
    const parsed = LoginInfoSchema.parse(body);

    expect(parsed.username).toBe('vera');
    expect(parsed.scopes).toEqual(['exec:admin', 'read:tap']);
    expect(parsed.csrf).toBeTruthy();
    // Advertises the full available-scope list for the admin UI's scope picker.
    expect(parsed.config.scopes).toEqual(AVAILABLE_SCOPES);
  });
});
