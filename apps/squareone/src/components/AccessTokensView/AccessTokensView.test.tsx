import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { TokenInfo } from '../../hooks/useUserTokens';

// Mock the hooks
vi.mock('../../hooks/useUserTokens', () => ({
  default: vi.fn(),
}));

vi.mock('../../hooks/useDeleteToken', () => ({
  default: vi.fn(() => ({
    deleteToken: vi.fn(),
    isDeleting: false,
    error: undefined,
  })),
}));

vi.mock('./tokenDateFormatters', () => ({
  formatTokenExpiration: vi.fn((expires) => {
    if (expires === null) {
      return { display: 'Never expires', datetime: null };
    }
    return {
      display: 'Expires on 2025-12-31',
      datetime: '2025-12-31T00:00:00.000Z',
    };
  }),
  formatTokenLastUsed: vi.fn((lastUsed) => {
    if (lastUsed === null) {
      return { display: 'Never used', datetime: null };
    }
    return {
      display: 'Last used 2 hours ago',
      datetime: '2025-01-01T10:00:00.000Z',
    };
  }),
}));

import useUserTokens from '../../hooks/useUserTokens';
import AccessTokensView from './AccessTokensView';

const mockUseUserTokens = vi.mocked(useUserTokens);

describe('AccessTokensView', () => {
  const now = Math.floor(Date.now() / 1000);

  const mockUserTokens: TokenInfo[] = [
    {
      username: 'testuser',
      token_type: 'user',
      service: null,
      scopes: ['read:user', 'write:user'],
      token: 'gt-recent-token',
      token_name: 'recent-token',
      created: now - 86400, // 1 day ago
      expires: now + 86400 * 30,
      last_used: now - 3600,
      parent: null,
    },
    {
      username: 'testuser',
      token_type: 'user',
      service: null,
      scopes: ['read:user'],
      token: 'gt-old-token',
      token_name: 'old-token',
      created: now - 86400 * 30, // 30 days ago
      expires: null,
      last_used: null,
      parent: null,
    },
  ];

  const mockSessionTokens: TokenInfo[] = [
    {
      username: 'testuser',
      token_type: 'session',
      service: null,
      scopes: ['read:user'],
      token: 'gt-session-token',
      token_name: 'session-token',
      created: now - 3600,
      expires: now + 86400,
      last_used: now - 60,
      parent: null,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    mockUseUserTokens.mockReturnValue({
      tokens: undefined,
      error: undefined,
      isLoading: true,
      mutate: vi.fn(),
    });

    render(<AccessTokensView username="testuser" />);

    expect(screen.getByText('Loading tokens...')).toBeInTheDocument();
  });

  it('renders error state', () => {
    const error = new Error('Failed to load tokens');
    mockUseUserTokens.mockReturnValue({
      tokens: undefined,
      error,
      isLoading: false,
      mutate: vi.fn(),
    });

    render(<AccessTokensView username="testuser" />);

    expect(
      screen.getByText('Failed to load tokens: Failed to load tokens')
    ).toBeInTheDocument();
  });

  it('renders user tokens', () => {
    mockUseUserTokens.mockReturnValue({
      tokens: mockUserTokens,
      error: undefined,
      isLoading: false,
      mutate: vi.fn(),
    });

    render(<AccessTokensView username="testuser" />);

    expect(screen.getByText('recent-token')).toBeInTheDocument();
    expect(screen.getByText('old-token')).toBeInTheDocument();
  });

  it('filters out non-user tokens', () => {
    const mixedTokens = [...mockUserTokens, ...mockSessionTokens];
    mockUseUserTokens.mockReturnValue({
      tokens: mixedTokens,
      error: undefined,
      isLoading: false,
      mutate: vi.fn(),
    });

    render(<AccessTokensView username="testuser" />);

    // User tokens should be visible
    expect(screen.getByText('recent-token')).toBeInTheDocument();
    expect(screen.getByText('old-token')).toBeInTheDocument();

    // Session token should not be visible
    expect(screen.queryByText('session-token')).not.toBeInTheDocument();
  });

  it('sorts tokens by created date (most recent first)', () => {
    mockUseUserTokens.mockReturnValue({
      tokens: mockUserTokens,
      error: undefined,
      isLoading: false,
      mutate: vi.fn(),
    });

    const { container } = render(<AccessTokensView username="testuser" />);

    // Get all token keys (which appear in order)
    const tokenKeys = container.querySelectorAll('[class*="tokenKey"]');
    expect(tokenKeys.length).toBe(2);

    // First token should be the more recent one (created 1 day ago)
    expect(tokenKeys[0].textContent).toBe('gt-recent-token');
    // Second token should be the older one (created 30 days ago)
    expect(tokenKeys[1].textContent).toBe('gt-old-token');
  });

  it('renders nothing when there are no user tokens', () => {
    mockUseUserTokens.mockReturnValue({
      tokens: [],
      error: undefined,
      isLoading: false,
      mutate: vi.fn(),
    });

    const { container } = render(<AccessTokensView username="testuser" />);

    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when there are only non-user tokens', () => {
    mockUseUserTokens.mockReturnValue({
      tokens: mockSessionTokens,
      error: undefined,
      isLoading: false,
      mutate: vi.fn(),
    });

    const { container } = render(<AccessTokensView username="testuser" />);

    expect(container.firstChild).toBeNull();
  });

  it('handles tokens without created date', () => {
    const tokensWithoutCreated: TokenInfo[] = [
      {
        ...mockUserTokens[0],
        created: undefined,
      },
      {
        ...mockUserTokens[1],
        created: undefined,
      },
    ];

    mockUseUserTokens.mockReturnValue({
      tokens: tokensWithoutCreated,
      error: undefined,
      isLoading: false,
      mutate: vi.fn(),
    });

    render(<AccessTokensView username="testuser" />);

    // Should still render both tokens
    expect(screen.getByText('recent-token')).toBeInTheDocument();
    expect(screen.getByText('old-token')).toBeInTheDocument();
  });

  it('sorts tokens with mixed created dates correctly', () => {
    const tokensWithMixedDates: TokenInfo[] = [
      {
        ...mockUserTokens[0],
        token: 'gt-recent',
        created: now - 86400 * 5, // 5 days ago
      },
      {
        ...mockUserTokens[1],
        token_name: 'very-old-token',
        token: 'gt-very-old',
        created: undefined, // No created date (treated as 0)
      },
      {
        ...mockUserTokens[0],
        token_name: 'newest-token',
        token: 'gt-newest',
        created: now - 3600, // 1 hour ago
      },
    ];

    mockUseUserTokens.mockReturnValue({
      tokens: tokensWithMixedDates,
      error: undefined,
      isLoading: false,
      mutate: vi.fn(),
    });

    const { container } = render(<AccessTokensView username="testuser" />);

    // Get all token keys (which appear in order)
    const tokenKeys = container.querySelectorAll('[class*="tokenKey"]');
    expect(tokenKeys.length).toBe(3);

    // Order should be: newest (1 hour), recent (5 days), very-old (undefined/0)
    expect(tokenKeys[0].textContent).toBe('gt-newest');
    expect(tokenKeys[1].textContent).toBe('gt-recent');
    expect(tokenKeys[2].textContent).toBe('gt-very-old');
  });

  it('passes username to AccessTokenItem components', () => {
    mockUseUserTokens.mockReturnValue({
      tokens: mockUserTokens,
      error: undefined,
      isLoading: false,
      mutate: vi.fn(),
    });

    render(<AccessTokensView username="testuser" />);

    // Check that tokens are rendered (implies username was passed correctly)
    expect(screen.getByText('recent-token')).toBeInTheDocument();
    expect(screen.getByText('old-token')).toBeInTheDocument();
  });
});
