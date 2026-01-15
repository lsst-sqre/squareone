/**
 * GafaelfawrQuery helper class for convenient data access.
 *
 * Provides methods to query and filter Gafaelfawr data structures.
 */
import type {
  LoginInfo,
  NotebookQuota,
  Scope,
  TokenInfo,
  UserInfo,
} from './schemas';

/**
 * Helper class for querying user information.
 */
export class UserInfoQuery {
  constructor(private userInfo: UserInfo) {}

  /** Get the username */
  get username(): string {
    return this.userInfo.username;
  }

  /** Get the user's display name */
  get name(): string | null {
    return this.userInfo.name ?? null;
  }

  /** Get the user's email */
  get email(): string | null {
    return this.userInfo.email ?? null;
  }

  /** Get the user's UID */
  get uid(): number | null {
    return this.userInfo.uid ?? null;
  }

  /** Get the user's GID */
  get gid(): number | null {
    return this.userInfo.gid ?? null;
  }

  /** Check if the user is authenticated (has a username) */
  get isAuthenticated(): boolean {
    return !!this.userInfo.username;
  }

  /** Get list of group names */
  getGroupNames(): string[] {
    return this.userInfo.groups.map((g) => g.name);
  }

  /** Check if user is member of a group */
  isMemberOf(groupName: string): boolean {
    return this.userInfo.groups.some((g) => g.name === groupName);
  }

  /** Get notebook quota (if any) */
  getNotebookQuota(): NotebookQuota | null {
    return this.userInfo.quota?.notebook ?? null;
  }

  /** Check if user can spawn notebooks */
  canSpawnNotebook(): boolean {
    return this.userInfo.quota?.notebook?.spawn ?? true;
  }

  /** Get the raw user info object */
  getRaw(): UserInfo {
    return this.userInfo;
  }
}

/**
 * Helper class for querying login information.
 */
export class LoginInfoQuery {
  constructor(private loginInfo: LoginInfo) {}

  /** Get the CSRF token for mutations */
  get csrfToken(): string {
    return this.loginInfo.csrf;
  }

  /** Get the authenticated username */
  get username(): string {
    return this.loginInfo.username;
  }

  /** Get the user's current scopes */
  get scopes(): string[] {
    return this.loginInfo.scopes;
  }

  /** Check if user has a specific scope */
  hasScope(scope: string): boolean {
    return this.loginInfo.scopes.includes(scope);
  }

  /** Get all available scopes with descriptions */
  getAvailableScopes(): Scope[] {
    return this.loginInfo.config.scopes;
  }

  /** Get description for a specific scope */
  getScopeDescription(scopeName: string): string | null {
    const scope = this.loginInfo.config.scopes.find(
      (s) => s.name === scopeName
    );
    return scope?.description ?? null;
  }

  /** Get the raw login info object */
  getRaw(): LoginInfo {
    return this.loginInfo;
  }
}

/**
 * Helper class for querying token lists.
 */
export class TokenListQuery {
  constructor(private tokens: TokenInfo[]) {}

  /** Get all tokens */
  getAll(): TokenInfo[] {
    return this.tokens;
  }

  /** Get number of tokens */
  get count(): number {
    return this.tokens.length;
  }

  /** Filter tokens by type */
  filterByType(type: TokenInfo['token_type']): TokenInfo[] {
    return this.tokens.filter((t) => t.token_type === type);
  }

  /** Get user tokens only */
  getUserTokens(): TokenInfo[] {
    return this.filterByType('user');
  }

  /** Get session tokens only */
  getSessionTokens(): TokenInfo[] {
    return this.filterByType('session');
  }

  /** Get all token names (non-null only) */
  getTokenNames(): string[] {
    return this.tokens
      .map((t) => t.token_name)
      .filter((name): name is string => name !== null && name !== undefined);
  }

  /** Find token by key */
  findByKey(key: string): TokenInfo | undefined {
    return this.tokens.find((t) => t.token === key);
  }

  /** Find token by name */
  findByName(name: string): TokenInfo | undefined {
    return this.tokens.find((t) => t.token_name === name);
  }

  /** Get tokens expiring soon (within specified milliseconds) */
  getExpiringSoon(withinMs: number): TokenInfo[] {
    const now = Date.now();
    const threshold = now + withinMs;

    return this.tokens.filter((t) => {
      if (!t.expires) return false;
      const expiresMs = t.expires * 1000;
      return expiresMs > now && expiresMs <= threshold;
    });
  }

  /** Get expired tokens */
  getExpired(): TokenInfo[] {
    const now = Date.now();

    return this.tokens.filter((t) => {
      if (!t.expires) return false;
      return t.expires * 1000 <= now;
    });
  }
}

/**
 * Factory function to create a UserInfoQuery instance.
 */
export function createUserInfoQuery(userInfo: UserInfo): UserInfoQuery {
  return new UserInfoQuery(userInfo);
}

/**
 * Factory function to create a LoginInfoQuery instance.
 */
export function createLoginInfoQuery(loginInfo: LoginInfo): LoginInfoQuery {
  return new LoginInfoQuery(loginInfo);
}

/**
 * Factory function to create a TokenListQuery instance.
 */
export function createTokenListQuery(tokens: TokenInfo[]): TokenListQuery {
  return new TokenListQuery(tokens);
}
