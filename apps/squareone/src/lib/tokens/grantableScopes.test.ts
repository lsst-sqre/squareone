import type { LoginInfo } from '@lsst-sqre/gafaelfawr-client';
import { describe, expect, it } from 'vitest';

import type { Scope } from '../../components/TokenForm';
import {
  getGrantableScopes,
  restrictToGrantableScopes,
} from './grantableScopes';

const tap: Scope = { name: 'read:tap', description: 'Read TAP' };
const image: Scope = { name: 'read:image', description: 'Read images' };

describe('getGrantableScopes', () => {
  it('keeps the configured scopes the user holds', () => {
    const loginInfo = {
      csrf: 'csrf',
      username: 'someuser',
      scopes: ['read:tap', 'user:token'],
      config: { scopes: [tap, image] },
    } as LoginInfo;

    expect(getGrantableScopes(loginInfo)).toEqual([tap]);
  });
});

describe('restrictToGrantableScopes', () => {
  it('keeps grantable scopes in requested order and reports the rest', () => {
    expect(
      restrictToGrantableScopes(
        { scopes: ['read:image', 'exec:notebook', 'read:tap'] },
        [tap, image]
      )
    ).toEqual({
      values: { scopes: ['read:image', 'read:tap'] },
      droppedScopes: ['exec:notebook'],
    });
  });

  it('omits scopes but keeps other values when none can be granted', () => {
    expect(
      restrictToGrantableScopes(
        {
          name: 'SIA token',
          scopes: ['read:image'],
          expiration: { type: 'never' },
        },
        [tap]
      )
    ).toEqual({
      values: { name: 'SIA token', expiration: { type: 'never' } },
      droppedScopes: ['read:image'],
    });
  });
});
