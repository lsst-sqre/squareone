// In-memory dev store for a user's Gafaelfawr access tokens.
//
// Backs the dev mocks of the Gafaelfawr per-user tokens API
// (`/auth/api/v1/users/:username/tokens*`) so `/settings/tokens` and
// `/settings/tokens/new` render and their list / create / detail / delete
// flows are exercisable end-to-end without a live Gafaelfawr. The store is
// keyed by username so switching personas from the `/dev` panel yields that
// persona's own tokens, seeded lazily on first access.
//
// It is colocated with the rest of the dev tooling so it never reaches the
// production build.

import type {
  CreateTokenRequest,
  TokenInfo,
} from '@lsst-sqre/gafaelfawr-client';

/** Per-username token collections, seeded lazily on first access. */
const tokensByUser = new Map<string, TokenInfo[]>();

/** Monotonic counter for deterministic, collision-free keys within a session. */
let counter = 0;

/** Characters used to pad generated 22-character token keys. */
const KEY_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789';

/**
 * Generate a 22-character token key (the `token` field of `TokenInfo`).
 *
 * Deterministic within a dev session: derived from the monotonic counter and
 * padded to the schema-required 22 characters, so created tokens never collide.
 */
function generateTokenKey(): string {
  counter += 1;
  const seed = `dev${counter}`;
  let key = seed;
  let i = 0;
  while (key.length < 22) {
    key += KEY_CHARS.charAt(i % KEY_CHARS.length);
    i += 1;
  }
  return key.slice(0, 22);
}

/** Build the seed set of tokens for a freshly-encountered username. */
function seedTokens(username: string): TokenInfo[] {
  const now = Math.floor(Date.now() / 1000);
  return [
    {
      username,
      token_type: 'user',
      service: null,
      scopes: ['read:tap'],
      created: now - 86400 * 30,
      expires: now + 86400 * 335,
      token: 'gtuser1234567890ab1cd0',
      token_name: 'TAP access token',
      last_used: now - 3600,
      parent: null,
    },
    {
      username,
      token_type: 'user',
      service: null,
      scopes: ['read:tap', 'read:image'],
      created: now - 86400 * 7,
      expires: null,
      token: 'gtmytoken12345678abcd0',
      token_name: 'CI Pipeline Token',
      last_used: null,
      parent: null,
    },
    {
      username,
      token_type: 'session',
      service: null,
      scopes: ['read:tap', 'exec:notebook', 'read:image'],
      created: now - 86400,
      expires: now + 86400 * 6,
      token: 'gtsession1234567890abc',
      token_name: null,
      last_used: now - 60,
      parent: null,
    },
  ];
}

/** Return (seeding if needed) the token collection for a username. */
function collection(username: string): TokenInfo[] {
  let tokens = tokensByUser.get(username);
  if (!tokens) {
    tokens = seedTokens(username);
    tokensByUser.set(username, tokens);
  }
  return tokens;
}

/**
 * Return all tokens for a user, most-recently-created first.
 *
 * Mirrors `GET /auth/api/v1/users/:username/tokens`.
 */
export function getDevUserTokens(username: string): TokenInfo[] {
  return [...collection(username)].sort(
    (a, b) => (b.created ?? 0) - (a.created ?? 0)
  );
}

/**
 * Return a single token by its 22-character key, or undefined if not found.
 *
 * Mirrors `GET /auth/api/v1/users/:username/tokens/:key`.
 */
export function getDevUserTokenByKey(
  username: string,
  key: string
): TokenInfo | undefined {
  return collection(username).find((token) => token.token === key);
}

/**
 * Create a new user token and return the created record.
 *
 * Mirrors the server's create behavior: the server assigns the key, creation
 * time, and (null) last-used, storing the record and returning it. Callers that
 * need the one-time full token string derive it from the returned key.
 */
export function addDevUserToken(
  username: string,
  request: CreateTokenRequest
): TokenInfo {
  const now = Math.floor(Date.now() / 1000);
  const record: TokenInfo = {
    username,
    token_type: 'user',
    service: null,
    scopes: request.scopes,
    created: now,
    expires: request.expires ?? null,
    token: generateTokenKey(),
    token_name: request.token_name,
    last_used: null,
    parent: null,
  };
  collection(username).unshift(record);
  return record;
}

/**
 * Delete (revoke) a token by key. Returns true if a token was removed.
 *
 * Mirrors `DELETE /auth/api/v1/users/:username/tokens/:key`.
 */
export function deleteDevUserToken(username: string, key: string): boolean {
  const tokens = collection(username);
  const index = tokens.findIndex((token) => token.token === key);
  if (index === -1) {
    return false;
  }
  tokens.splice(index, 1);
  return true;
}

/** Reset all stored tokens to the unseeded state. Primarily for tests. */
export function resetDevUserTokens(): void {
  tokensByUser.clear();
  counter = 0;
}
