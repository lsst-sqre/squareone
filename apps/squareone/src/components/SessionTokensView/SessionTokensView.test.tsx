import type { TokenInfo } from '@lsst-sqre/gafaelfawr-client';
import * as gafaelfawrClient from '@lsst-sqre/gafaelfawr-client';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the gafaelfawr-client hooks
vi.mock('@lsst-sqre/gafaelfawr-client', async () => {
  const actual = await vi.importActual('@lsst-sqre/gafaelfawr-client');
  return {
    ...actual,
    useUserTokens: vi.fn(),
    useDeleteToken: vi.fn(() => ({
      deleteToken: vi.fn(),
      isDeleting: false,
      error: null,
      reset: vi.fn(),
    })),
  };
});

vi.mock('../TokenDate/formatters', () => ({
  formatTokenExpiration: vi.fn((expires) => {
    if (expires === null) {
      return { display: 'Never expires', datetime: null };
    }
    return {
      display: 'Expires on 2025-12-31',
      datetime: '2025-12-31T00:00:00.000Z',
    };
  }),
}));

import SessionTokensView from './SessionTokensView';

const mockUseUserTokens = vi.mocked(gafaelfawrClient.useUserTokens);

describe('SessionTokensView', () => {
  const now = Math.floor(Date.now() / 1000);

  const mockSessionTokens: TokenInfo[] = [
    {
      username: 'testuser',
      token_type: 'session',
      service: null,
      scopes: ['read:image', 'read:tap'],
      token: 'gt-session-recent',
      token_name: 'recent-web-session',
      created: now - 3600, // 1 hour ago
      expires: now + 3600 * 24,
      parent: null,
    },
    {
      username: 'testuser',
      token_type: 'session',
      service: null,
      scopes: ['read:image'],
      token: 'gt-session-old',
      token_name: 'old-web-session',
      created: now - 7200, // 2 hours ago
      expires: null,
      parent: null,
    },
  ];

  const mockNotebookTokens: TokenInfo[] = [
    {
      username: 'testuser',
      token_type: 'notebook',
      service: null,
      scopes: ['exec:notebook', 'read:image'],
      token: 'gt-notebook-token',
      token_name: 'notebook-session',
      created: now - 86400, // 1 day ago
      expires: now + 86400 * 7,
      parent: null,
    },
  ];

  const mockInternalTokens: TokenInfo[] = [
    {
      username: 'testuser',
      token_type: 'internal',
      service: null,
      scopes: ['read:all', 'write:all'],
      token: 'gt-internal-token',
      token_name: 'internal-token',
      created: now - 86400 * 30, // 30 days ago
      expires: now + 86400 * 90,
      parent: null,
    },
  ];

  const mockUserTokens: TokenInfo[] = [
    {
      username: 'testuser',
      token_type: 'user',
      service: null,
      scopes: ['read:image'],
      token: 'gt-user-token',
      token_name: 'user-token',
      created: now - 86400,
      expires: now + 86400 * 30,
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
      query: null,
      isPending: false,
      refetch: vi.fn(),
      invalidate: vi.fn(),
    });

    render(<SessionTokensView username="testuser" tokenType="session" />);

    expect(screen.getByText('Loading tokens...')).toBeInTheDocument();
  });

  it('renders error state', () => {
    const error = new Error('Failed to load tokens');
    mockUseUserTokens.mockReturnValue({
      tokens: undefined,
      error,
      isLoading: false,
      query: null,
      isPending: false,
      refetch: vi.fn(),
      invalidate: vi.fn(),
    });

    render(<SessionTokensView username="testuser" tokenType="session" />);

    expect(
      screen.getByText('Failed to load tokens: Failed to load tokens')
    ).toBeInTheDocument();
  });

  it('renders session tokens when tokenType is session', () => {
    mockUseUserTokens.mockReturnValue({
      tokens: mockSessionTokens,
      error: undefined,
      isLoading: false,
      query: null,
      isPending: false,
      refetch: vi.fn(),
      invalidate: vi.fn(),
    });

    render(<SessionTokensView username="testuser" tokenType="session" />);

    expect(screen.getByText('recent-web-session')).toBeInTheDocument();
    expect(screen.getByText('old-web-session')).toBeInTheDocument();
  });

  it('renders notebook tokens when tokenType is notebook', () => {
    mockUseUserTokens.mockReturnValue({
      tokens: mockNotebookTokens,
      error: undefined,
      isLoading: false,
      query: null,
      isPending: false,
      refetch: vi.fn(),
      invalidate: vi.fn(),
    });

    render(<SessionTokensView username="testuser" tokenType="notebook" />);

    expect(screen.getByText('notebook-session')).toBeInTheDocument();
  });

  it('renders internal tokens when tokenType is internal', () => {
    mockUseUserTokens.mockReturnValue({
      tokens: mockInternalTokens,
      error: undefined,
      isLoading: false,
      query: null,
      isPending: false,
      refetch: vi.fn(),
      invalidate: vi.fn(),
    });

    render(<SessionTokensView username="testuser" tokenType="internal" />);

    expect(screen.getByText('internal-token')).toBeInTheDocument();
  });

  it('filters to only specified token type', () => {
    const mixedTokens = [
      ...mockSessionTokens,
      ...mockNotebookTokens,
      ...mockInternalTokens,
      ...mockUserTokens,
    ];

    mockUseUserTokens.mockReturnValue({
      tokens: mixedTokens,
      error: undefined,
      isLoading: false,
      query: null,
      isPending: false,
      refetch: vi.fn(),
      invalidate: vi.fn(),
    });

    render(<SessionTokensView username="testuser" tokenType="session" />);

    // Session tokens should be visible
    expect(screen.getByText('recent-web-session')).toBeInTheDocument();
    expect(screen.getByText('old-web-session')).toBeInTheDocument();

    // Other token types should not be visible
    expect(screen.queryByText('notebook-session')).not.toBeInTheDocument();
    expect(screen.queryByText('internal-token')).not.toBeInTheDocument();
    expect(screen.queryByText('user-token')).not.toBeInTheDocument();
  });

  it('sorts tokens by created date (most recent first)', () => {
    mockUseUserTokens.mockReturnValue({
      tokens: mockSessionTokens,
      error: undefined,
      isLoading: false,
      query: null,
      isPending: false,
      refetch: vi.fn(),
      invalidate: vi.fn(),
    });

    const { container } = render(
      <SessionTokensView username="testuser" tokenType="session" />
    );

    // Get all token keys (which appear in order)
    const tokenKeys = container.querySelectorAll('[class*="tokenKey"]');
    expect(tokenKeys.length).toBe(2);

    // First token should be the more recent one (created 1 hour ago)
    expect(tokenKeys[0].textContent).toBe('gt-session-recent');
    // Second token should be the older one (created 2 hours ago)
    expect(tokenKeys[1].textContent).toBe('gt-session-old');
  });

  it('renders nothing when there are no tokens of specified type', () => {
    mockUseUserTokens.mockReturnValue({
      tokens: [],
      error: undefined,
      isLoading: false,
      query: null,
      isPending: false,
      refetch: vi.fn(),
      invalidate: vi.fn(),
    });

    const { container } = render(
      <SessionTokensView username="testuser" tokenType="session" />
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when there are only tokens of other types', () => {
    mockUseUserTokens.mockReturnValue({
      tokens: mockUserTokens,
      error: undefined,
      isLoading: false,
      query: null,
      isPending: false,
      refetch: vi.fn(),
      invalidate: vi.fn(),
    });

    const { container } = render(
      <SessionTokensView username="testuser" tokenType="session" />
    );

    expect(container.firstChild).toBeNull();
  });

  it('handles tokens without created date', () => {
    const tokensWithoutCreated: TokenInfo[] = [
      {
        ...mockSessionTokens[0],
        created: undefined,
      },
      {
        ...mockSessionTokens[1],
        created: undefined,
      },
    ];

    mockUseUserTokens.mockReturnValue({
      tokens: tokensWithoutCreated,
      error: undefined,
      isLoading: false,
      query: null,
      isPending: false,
      refetch: vi.fn(),
      invalidate: vi.fn(),
    });

    render(<SessionTokensView username="testuser" tokenType="session" />);

    // Should still render both tokens
    expect(screen.getByText('recent-web-session')).toBeInTheDocument();
    expect(screen.getByText('old-web-session')).toBeInTheDocument();
  });

  it('sorts tokens with mixed created dates correctly', () => {
    const tokensWithMixedDates: TokenInfo[] = [
      {
        ...mockSessionTokens[0],
        token: 'gt-session-5days',
        created: now - 86400 * 5, // 5 days ago
      },
      {
        ...mockSessionTokens[1],
        token_name: 'very-old-session',
        token: 'gt-session-very-old',
        created: undefined, // No created date (treated as 0)
      },
      {
        ...mockSessionTokens[0],
        token_name: 'newest-session',
        token: 'gt-session-newest',
        created: now - 1800, // 30 minutes ago
      },
    ];

    mockUseUserTokens.mockReturnValue({
      tokens: tokensWithMixedDates,
      error: undefined,
      isLoading: false,
      query: null,
      isPending: false,
      refetch: vi.fn(),
      invalidate: vi.fn(),
    });

    const { container } = render(
      <SessionTokensView username="testuser" tokenType="session" />
    );

    // Get all token keys (which appear in order)
    const tokenKeys = container.querySelectorAll('[class*="tokenKey"]');
    expect(tokenKeys.length).toBe(3);

    // Order should be: newest (30 min), 5days, very-old (undefined/0)
    expect(tokenKeys[0].textContent).toBe('gt-session-newest');
    expect(tokenKeys[1].textContent).toBe('gt-session-5days');
    expect(tokenKeys[2].textContent).toBe('gt-session-very-old');
  });

  it('passes username to SessionTokenItem components', () => {
    mockUseUserTokens.mockReturnValue({
      tokens: mockSessionTokens,
      error: undefined,
      isLoading: false,
      query: null,
      isPending: false,
      refetch: vi.fn(),
      invalidate: vi.fn(),
    });

    render(<SessionTokensView username="testuser" tokenType="session" />);

    // Check that tokens are rendered (implies username was passed correctly)
    expect(screen.getByText('recent-web-session')).toBeInTheDocument();
    expect(screen.getByText('old-web-session')).toBeInTheDocument();
  });
});
