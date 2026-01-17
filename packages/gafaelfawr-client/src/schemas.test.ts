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
  CreateTokenRequestSchema,
  CreateTokenResponseSchema,
  ErrorResponseSchema,
  GroupSchema,
  LoginInfoSchema,
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
    expect(result.config.scopes).toHaveLength(5);
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
