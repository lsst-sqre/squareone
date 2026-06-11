import type { TokenInfo } from '@lsst-sqre/gafaelfawr-client';
import * as gafaelfawrClient from '@lsst-sqre/gafaelfawr-client';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as useRepertoireUrlModule from '../../../../hooks/useRepertoireUrl';

vi.mock('@lsst-sqre/gafaelfawr-client', async (importOriginal) => {
  const actual = await importOriginal<typeof gafaelfawrClient>();
  return {
    ...actual,
    useUserTokens: vi.fn(),
    useDeleteToken: vi.fn(),
  };
});
vi.mock('../../../../hooks/useRepertoireUrl');

// Render next/link as a plain anchor so the "create a new service token" link's
// href can be asserted and the (link-free) service-token keys can be checked.
vi.mock('next/link', () => ({
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

const mockPush = vi.fn();
let mockSearchParams = new URLSearchParams();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams,
}));

import SearchServiceTokensPageClient from './SearchServiceTokensPageClient';

const mockUseUserTokens = vi.mocked(gafaelfawrClient.useUserTokens);
const mockUseDeleteToken = vi.mocked(gafaelfawrClient.useDeleteToken);
const mockUseRepertoireUrl = vi.mocked(useRepertoireUrlModule.useRepertoireUrl);

const now = Math.floor(Date.now() / 1000);

const mockServiceTokens: TokenInfo[] = [
  {
    username: 'bot-ci',
    token_type: 'service',
    service: null,
    scopes: ['read:tap'],
    token: 'gt-service-token-key',
    token_name: 'ci-token',
    created: now - 7200,
    expires: null,
    last_used: null,
    parent: null,
  },
];

function tokensResult(
  tokens: TokenInfo[] | undefined
): ReturnType<typeof gafaelfawrClient.useUserTokens> {
  return {
    tokens,
    error: null,
    isLoading: false,
    isPending: false,
    query: null,
    refetch: vi.fn(),
    invalidate: vi.fn(),
  };
}

describe('SearchServiceTokensPageClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
    mockUseRepertoireUrl.mockReturnValue(undefined);
    mockUseUserTokens.mockReturnValue(tokensResult(mockServiceTokens));
    mockUseDeleteToken.mockReturnValue({
      deleteToken: vi.fn().mockResolvedValue(undefined),
      isDeleting: false,
      error: null,
      reset: vi.fn(),
    });
  });

  it('renders the heading and a link to create a new service token', () => {
    render(<SearchServiceTokensPageClient />);

    expect(
      screen.getByRole('heading', { level: 1, name: /look up service tokens/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /create a new service token/i })
    ).toHaveAttribute('href', '/admin/service-tokens/new');
  });

  it('prompts for a bot username and issues no request when q is empty', () => {
    render(<SearchServiceTokensPageClient />);

    expect(screen.getByText(/enter a bot username/i)).toBeInTheDocument();
    expect(mockUseUserTokens).not.toHaveBeenCalled();
  });

  it("seeds the box from ?q= and lists that bot user's service tokens without a details link", () => {
    mockSearchParams = new URLSearchParams('q=bot-ci');
    render(<SearchServiceTokensPageClient />);

    // The box is seeded from the URL param.
    expect(screen.getByLabelText('Bot user')).toHaveValue('bot-ci');
    // The looked-up bot user's service tokens are listed.
    expect(screen.getByText('ci-token')).toBeInTheDocument();
    expect(mockUseUserTokens).toHaveBeenCalledWith('bot-ci', undefined);
    // The token key renders as plain text (no /settings/tokens/<key> link).
    expect(
      screen.queryByRole('link', { name: 'gt-service-token-key' })
    ).not.toBeInTheDocument();
  });

  it('shows an error and issues no request for an invalid, non-bot q', () => {
    mockSearchParams = new URLSearchParams('q=alice');
    render(<SearchServiceTokensPageClient />);

    expect(screen.getByText(/must start with "bot-"/i)).toBeInTheDocument();
    expect(mockUseUserTokens).not.toHaveBeenCalled();
  });

  it('shows an empty-state message when the bot user has no service tokens', () => {
    mockSearchParams = new URLSearchParams('q=bot-empty');
    mockUseUserTokens.mockReturnValue(tokensResult([]));
    render(<SearchServiceTokensPageClient />);

    expect(screen.getByText(/no service tokens/i)).toBeInTheDocument();
  });

  it('pushes the trimmed entry as ?q= on submit (new history entry)', async () => {
    const user = userEvent.setup();
    render(<SearchServiceTokensPageClient />);

    await user.type(screen.getByLabelText('Bot user'), '  bot-new  ');
    await user.click(screen.getByRole('button', { name: /look up tokens/i }));

    expect(mockPush).toHaveBeenCalledWith(
      '/admin/service-tokens/search?q=bot-new'
    );
  });

  it('points the create link at /new?username=<q> when q is a valid bot username', () => {
    mockSearchParams = new URLSearchParams('q=bot-ci');
    render(<SearchServiceTokensPageClient />);

    expect(
      screen.getByRole('link', { name: /create a new service token/i })
    ).toHaveAttribute('href', '/admin/service-tokens/new?username=bot-ci');
  });

  it('keeps the bare create link when q is invalid', () => {
    mockSearchParams = new URLSearchParams('q=alice');
    render(<SearchServiceTokensPageClient />);

    expect(
      screen.getByRole('link', { name: /create a new service token/i })
    ).toHaveAttribute('href', '/admin/service-tokens/new');
  });
});
