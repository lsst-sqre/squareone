import { describe, expect, it } from 'vitest';

import type { TokenFormValues } from '../../components/TokenForm';
import { buildTokenTemplateUrl, parseTokenTemplateParams } from './templateUrl';

const baseUrl = 'https://example.com/settings/tokens/new';

/** The search parameters of a built template URL. */
function paramsOf(url: string): URLSearchParams {
  return new URL(url, 'https://example.com').searchParams;
}

describe('buildTokenTemplateUrl', () => {
  it('encodes the scopes as one comma-separated scopes parameter', () => {
    const url = buildTokenTemplateUrl(baseUrl, {
      scopes: ['read:image', 'read:tap'],
    });

    expect(url).toBe(
      'https://example.com/settings/tokens/new?scopes=read%3Aimage%2Cread%3Atap'
    );
    expect(paramsOf(url).getAll('scope')).toEqual([]);
  });

  it('encodes the trimmed name, scopes, and expiration in that order', () => {
    expect(
      buildTokenTemplateUrl(baseUrl, {
        name: '  Test Token  ',
        scopes: ['read:all', 'user:token'],
        expiration: { type: 'preset', value: '7d' },
      })
    ).toBe(
      'https://example.com/settings/tokens/new?name=Test+Token&scopes=read%3Aall%2Cuser%3Atoken&expiration=7d'
    );
  });

  it('encodes a never-expiring token as expiration=never', () => {
    expect(
      buildTokenTemplateUrl(baseUrl, { expiration: { type: 'never' } })
    ).toBe('https://example.com/settings/tokens/new?expiration=never');
  });

  it('omits an empty name and empty scopes', () => {
    expect(
      buildTokenTemplateUrl(baseUrl, {
        name: '   ',
        scopes: [],
        expiration: { type: 'preset', value: '30d' },
      })
    ).toBe('https://example.com/settings/tokens/new?expiration=30d');
  });

  it('returns the bare base url when there is nothing to encode', () => {
    expect(buildTokenTemplateUrl('/settings/tokens/new', {})).toBe(
      '/settings/tokens/new'
    );
  });
});

describe('parseTokenTemplateParams', () => {
  it('reads comma-separated scopes from the scopes parameter', () => {
    expect(
      parseTokenTemplateParams(
        new URLSearchParams('scopes=read:tap,read:image')
      )
    ).toEqual({ scopes: ['read:tap', 'read:image'] });
  });

  it('accepts the legacy repeated scope parameter, merged with scopes', () => {
    expect(
      parseTokenTemplateParams(
        new URLSearchParams(
          'scopes=read:tap&scope=read%3Aimage&scope=user:token,read:tap'
        )
      )
    ).toEqual({ scopes: ['read:tap', 'read:image', 'user:token'] });
  });

  it('trims scope names and drops empty entries', () => {
    expect(
      parseTokenTemplateParams(
        new URLSearchParams('scopes= read:all ,, user:token ')
      )
    ).toEqual({ scopes: ['read:all', 'user:token'] });
  });

  it('reads the trimmed name and a known expiration', () => {
    expect(
      parseTokenTemplateParams(
        new URLSearchParams('name=+My+Token+&expiration=90d')
      )
    ).toEqual({
      name: 'My Token',
      expiration: { type: 'preset', value: '90d' },
    });
  });

  it('ignores an unknown expiration, a blank name, and unrelated parameters', () => {
    expect(
      parseTokenTemplateParams(
        new URLSearchParams('name=+&expiration=forever&other=1')
      )
    ).toEqual({});
  });
});

describe('token template url round trip', () => {
  const cases: [string, TokenFormValues][] = [
    [
      'name, several scopes, and a preset expiration',
      {
        name: 'My API token',
        scopes: ['read:image', 'read:tap', 'user:token'],
        expiration: { type: 'preset', value: '30d' },
      },
    ],
    [
      'special characters in the name and a never-expiring token',
      {
        name: 'Token & more, 100%!',
        scopes: ['exec:notebook'],
        expiration: { type: 'never' },
      },
    ],
  ];

  it.each(cases)('parses back what it built: %s', (_, values) => {
    expect(
      parseTokenTemplateParams(paramsOf(buildTokenTemplateUrl(baseUrl, values)))
    ).toEqual(values);
  });
});
