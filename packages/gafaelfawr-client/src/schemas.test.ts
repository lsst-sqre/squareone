/**
 * Tests for Gafaelfawr Zod schemas.
 */
import { describe, expect, it } from 'vitest';

import {
  mockLoginInfo,
  mockTokenHistory,
  mockTokens,
  mockUserInfo,
} from './mock-data';
import {
  AdminTokenRequestSchema,
  CreateTokenRequestSchema,
  CreateTokenResponseSchema,
  ErrorResponseSchema,
  GroupSchema,
  LoginInfoSchema,
  OIDCClientSchema,
  OIDCClientUpdateSchema,
  OIDCClientWithSecretSchema,
  TokenChangeHistoryEntrySchema,
  TokenInfoSchema,
  TokenTypeSchema,
  UserInfoSchema,
  ValidationErrorSchema,
} from './schemas';

describe('TokenTypeSchema', () => {
  it('accepts valid token types', () => {
    expect(TokenTypeSchema.parse('session')).toBe('session');
    expect(TokenTypeSchema.parse('user')).toBe('user');
    expect(TokenTypeSchema.parse('notebook')).toBe('notebook');
    expect(TokenTypeSchema.parse('internal')).toBe('internal');
    expect(TokenTypeSchema.parse('service')).toBe('service');
    expect(TokenTypeSchema.parse('oidc')).toBe('oidc');
  });

  it('rejects invalid token types', () => {
    expect(() => TokenTypeSchema.parse('invalid')).toThrow();
    expect(() => TokenTypeSchema.parse('')).toThrow();
    expect(() => TokenTypeSchema.parse(123)).toThrow();
  });
});

describe('GroupSchema', () => {
  it('accepts valid group', () => {
    const result = GroupSchema.parse({ name: 'science', id: 100 });
    expect(result).toEqual({ name: 'science', id: 100 });
  });

  it('rejects empty name', () => {
    expect(() => GroupSchema.parse({ name: '', id: 100 })).toThrow();
  });

  it('rejects invalid id', () => {
    expect(() => GroupSchema.parse({ name: 'science', id: 0 })).toThrow();
    expect(() => GroupSchema.parse({ name: 'science', id: -1 })).toThrow();
  });
});

describe('UserInfoSchema', () => {
  it('parses mock user info', () => {
    const result = UserInfoSchema.parse(mockUserInfo);
    expect(result.username).toBe('testuser');
    expect(result.groups).toHaveLength(2);
  });

  it('accepts minimal user info', () => {
    const result = UserInfoSchema.parse({ username: 'user' });
    expect(result.username).toBe('user');
    expect(result.groups).toEqual([]);
    expect(result.name).toBeUndefined();
  });

  it('accepts user info with null optional fields', () => {
    const result = UserInfoSchema.parse({
      username: 'user',
      name: null,
      email: null,
      uid: null,
      gid: null,
      quota: null,
    });
    expect(result.username).toBe('user');
    expect(result.name).toBeNull();
  });

  it('rejects empty username', () => {
    expect(() => UserInfoSchema.parse({ username: '' })).toThrow();
  });

  it('rejects username over 64 characters', () => {
    expect(() => UserInfoSchema.parse({ username: 'a'.repeat(65) })).toThrow();
  });
});

describe('LoginInfoSchema', () => {
  it('parses mock login info', () => {
    const result = LoginInfoSchema.parse(mockLoginInfo);
    expect(result.csrf).toBe(mockLoginInfo.csrf);
    expect(result.username).toBe('testuser');
    expect(result.scopes).toHaveLength(3);
    expect(result.config.scopes).toHaveLength(6);
  });

  it('requires all fields', () => {
    expect(() => LoginInfoSchema.parse({})).toThrow();
    expect(() =>
      LoginInfoSchema.parse({ csrf: 'token', username: 'user' })
    ).toThrow();
  });
});

describe('TokenInfoSchema', () => {
  it('parses mock tokens', () => {
    for (const token of mockTokens) {
      const result = TokenInfoSchema.parse(token);
      expect(result.token).toHaveLength(22);
      expect(result.username).toBe('testuser');
    }
  });

  it('accepts token with minimal fields', () => {
    const minimal = {
      username: 'user',
      token_type: 'user',
      scopes: [],
      token: 'gt-abc123def456ghij789', // 22 chars
    };
    const result = TokenInfoSchema.parse(minimal);
    expect(result.username).toBe('user');
    expect(result.token_type).toBe('user');
  });

  it('validates token key length', () => {
    expect(() =>
      TokenInfoSchema.parse({
        username: 'user',
        token_type: 'user',
        scopes: [],
        token: 'short',
      })
    ).toThrow();

    expect(() =>
      TokenInfoSchema.parse({
        username: 'user',
        token_type: 'user',
        scopes: [],
        token: 'this-is-way-too-long-to-be-valid',
      })
    ).toThrow();
  });
});

describe('TokenChangeHistoryEntrySchema', () => {
  it('parses mock history entries', () => {
    for (const entry of mockTokenHistory) {
      const result = TokenChangeHistoryEntrySchema.parse(entry);
      expect(result.token).toHaveLength(22);
      expect(result.event_time).toBeGreaterThan(0);
    }
  });

  it('validates action type', () => {
    const validActions = ['create', 'revoke', 'expire', 'edit'];
    for (const action of validActions) {
      const entry = { ...mockTokenHistory[0], action };
      expect(() => TokenChangeHistoryEntrySchema.parse(entry)).not.toThrow();
    }

    expect(() =>
      TokenChangeHistoryEntrySchema.parse({
        ...mockTokenHistory[0],
        action: 'invalid',
      })
    ).toThrow();
  });
});

describe('CreateTokenRequestSchema', () => {
  it('accepts valid request', () => {
    const result = CreateTokenRequestSchema.parse({
      token_name: 'My Token',
      scopes: ['read:tap'],
      expires: 1700000000,
    });
    expect(result.token_name).toBe('My Token');
    expect(result.scopes).toEqual(['read:tap']);
    expect(result.expires).toBe(1700000000);
  });

  it('accepts request without expiration', () => {
    const result = CreateTokenRequestSchema.parse({
      token_name: 'My Token',
      scopes: [],
    });
    expect(result.expires).toBeUndefined();
  });

  it('accepts null expiration', () => {
    const result = CreateTokenRequestSchema.parse({
      token_name: 'My Token',
      scopes: [],
      expires: null,
    });
    expect(result.expires).toBeNull();
  });

  it('rejects empty token name', () => {
    expect(() =>
      CreateTokenRequestSchema.parse({
        token_name: '',
        scopes: [],
      })
    ).toThrow();
  });

  it('rejects token name over 64 characters', () => {
    expect(() =>
      CreateTokenRequestSchema.parse({
        token_name: 'a'.repeat(65),
        scopes: [],
      })
    ).toThrow();
  });
});

describe('AdminTokenRequestSchema', () => {
  it('accepts a minimal valid service-token request', () => {
    const result = AdminTokenRequestSchema.parse({
      username: 'bot-example',
      token_type: 'service',
      scopes: ['read:tap'],
    });
    expect(result.username).toBe('bot-example');
    expect(result.token_type).toBe('service');
    expect(result.scopes).toEqual(['read:tap']);
  });

  it('does not carry a token_name (the service path rejects it)', () => {
    // Gafaelfawr's service path 422s on `token_name`, so the schema no longer
    // defines it; any supplied value is stripped rather than forwarded.
    const result = AdminTokenRequestSchema.parse({
      username: 'bot-example',
      token_type: 'service',
      token_name: 'CI token',
      scopes: ['read:tap'],
    });
    expect(result).not.toHaveProperty('token_name');
  });

  it('accepts a request including optional metadata', () => {
    const result = AdminTokenRequestSchema.parse({
      username: 'bot-example',
      token_type: 'service',
      scopes: ['read:tap', 'read:image'],
      expires: 1700000000,
      name: 'Example Bot',
      email: 'bot@example.com',
      uid: 90000,
      gid: 90000,
      groups: [{ name: 'bots', id: 90000 }],
    });
    expect(result.expires).toBe(1700000000);
    expect(result.name).toBe('Example Bot');
    expect(result.email).toBe('bot@example.com');
    expect(result.uid).toBe(90000);
    expect(result.gid).toBe(90000);
    expect(result.groups).toEqual([{ name: 'bots', id: 90000 }]);
  });

  it('accepts null expiration', () => {
    const result = AdminTokenRequestSchema.parse({
      username: 'bot-example',
      token_type: 'service',
      scopes: [],
      expires: null,
    });
    expect(result.expires).toBeNull();
  });

  it('rejects a missing username', () => {
    expect(() =>
      AdminTokenRequestSchema.parse({
        token_type: 'service',
        scopes: ['read:tap'],
      })
    ).toThrow();
  });

  it('rejects a non-service token type', () => {
    expect(() =>
      AdminTokenRequestSchema.parse({
        username: 'bot-example',
        token_type: 'user',
        scopes: ['read:tap'],
      })
    ).toThrow();
  });
});

describe('CreateTokenResponseSchema', () => {
  it('accepts valid response', () => {
    const result = CreateTokenResponseSchema.parse({
      token: 'gt-full-token-string-here',
    });
    expect(result.token).toBe('gt-full-token-string-here');
  });

  it('rejects missing token', () => {
    expect(() => CreateTokenResponseSchema.parse({})).toThrow();
  });
});

describe('ValidationErrorSchema', () => {
  it('accepts validation error with location', () => {
    const result = ValidationErrorSchema.parse({
      loc: ['body', 'token_name'],
      msg: 'field required',
      type: 'value_error.missing',
    });
    expect(result.loc).toEqual(['body', 'token_name']);
    expect(result.msg).toBe('field required');
  });

  it('accepts validation error without location', () => {
    const result = ValidationErrorSchema.parse({
      msg: 'invalid value',
      type: 'value_error',
    });
    expect(result.loc).toBeUndefined();
    expect(result.msg).toBe('invalid value');
  });
});

describe('ErrorResponseSchema', () => {
  it('accepts string detail', () => {
    const result = ErrorResponseSchema.parse({
      detail: 'Something went wrong',
    });
    expect(result.detail).toBe('Something went wrong');
  });

  it('accepts single validation error', () => {
    const result = ErrorResponseSchema.parse({
      detail: { msg: 'invalid', type: 'error' },
    });
    expect(result.detail).toEqual({ msg: 'invalid', type: 'error' });
  });

  it('accepts array of validation errors', () => {
    const result = ErrorResponseSchema.parse({
      detail: [
        { loc: ['body', 'field1'], msg: 'required', type: 'missing' },
        { loc: ['body', 'field2'], msg: 'invalid', type: 'type_error' },
      ],
    });
    expect(Array.isArray(result.detail)).toBe(true);
    expect((result.detail as unknown[]).length).toBe(2);
  });
});

describe('OIDCClientSchema', () => {
  const validClient = {
    return_uri: 'https://example.org/oauth2/callback',
    description: 'Example relying party',
    notes: 'Owned by the science platform team',
    client_id: 'oidc-client-abc123',
    last_modified_by: 'vera',
    created: '2026-01-02T03:04:05Z',
    last_modified: '2026-02-03T04:05:06+00:00',
    url: 'https://example.org/',
  };

  it('parses a complete client', () => {
    const result = OIDCClientSchema.parse(validClient);
    expect(result.client_id).toBe('oidc-client-abc123');
    expect(result.return_uri).toBe('https://example.org/oauth2/callback');
    expect(result.last_modified_by).toBe('vera');
  });

  it('accepts null notes and url', () => {
    const result = OIDCClientSchema.parse({
      ...validClient,
      notes: null,
      url: null,
    });
    expect(result.notes).toBeNull();
    expect(result.url).toBeNull();
  });

  it('accepts omitted notes and url', () => {
    const { notes: _notes, url: _url, ...withoutOptional } = validClient;
    const result = OIDCClientSchema.parse(withoutOptional);
    expect(result.notes).toBeUndefined();
    expect(result.url).toBeUndefined();
  });

  it('rejects a non-ISO created timestamp', () => {
    expect(() =>
      OIDCClientSchema.parse({ ...validClient, created: 'yesterday' })
    ).toThrow();
  });

  it('rejects a missing client_id', () => {
    const { client_id: _clientId, ...withoutId } = validClient;
    expect(() => OIDCClientSchema.parse(withoutId)).toThrow();
  });

  it('does not carry a client_secret', () => {
    const result = OIDCClientSchema.parse({
      ...validClient,
      client_secret: 'should-be-stripped',
    });
    expect(result).not.toHaveProperty('client_secret');
  });
});

describe('OIDCClientWithSecretSchema', () => {
  const validClientWithSecret = {
    return_uri: 'https://example.org/oauth2/callback',
    description: 'Example relying party',
    notes: null,
    client_id: 'oidc-client-abc123',
    last_modified_by: 'vera',
    created: '2026-01-02T03:04:05Z',
    last_modified: '2026-01-02T03:04:05Z',
    url: null,
    client_secret: 'super-secret-value',
  };

  it('parses a created client including its one-time secret', () => {
    const result = OIDCClientWithSecretSchema.parse(validClientWithSecret);
    expect(result.client_secret).toBe('super-secret-value');
    expect(result.client_id).toBe('oidc-client-abc123');
  });

  it('rejects a response missing the secret', () => {
    const { client_secret: _secret, ...withoutSecret } = validClientWithSecret;
    expect(() => OIDCClientWithSecretSchema.parse(withoutSecret)).toThrow();
  });
});

describe('OIDCClientUpdateSchema', () => {
  it('parses a minimal update', () => {
    const result = OIDCClientUpdateSchema.parse({
      return_uri: 'https://example.org/oauth2/callback',
      description: 'Example relying party',
    });
    expect(result.description).toBe('Example relying party');
    expect(result.notes).toBeUndefined();
  });

  it('accepts null notes', () => {
    const result = OIDCClientUpdateSchema.parse({
      return_uri: 'https://example.org/oauth2/callback',
      description: 'Example relying party',
      notes: null,
    });
    expect(result.notes).toBeNull();
  });

  it('rejects an empty return_uri', () => {
    expect(() =>
      OIDCClientUpdateSchema.parse({ return_uri: '', description: 'x' })
    ).toThrow();
  });

  it('rejects an empty description', () => {
    expect(() =>
      OIDCClientUpdateSchema.parse({
        return_uri: 'https://example.org/cb',
        description: '',
      })
    ).toThrow();
  });
});
