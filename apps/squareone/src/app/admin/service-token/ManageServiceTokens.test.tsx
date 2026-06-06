import type { TokenInfo } from '@lsst-sqre/gafaelfawr-client';
import * as gafaelfawrClient from '@lsst-sqre/gafaelfawr-client';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as useRepertoireUrlModule from '../../../hooks/useRepertoireUrl';

vi.mock('@lsst-sqre/gafaelfawr-client', async (importOriginal) => {
  const actual = await importOriginal<typeof gafaelfawrClient>();
  return {
    ...actual,
    useUserTokens: vi.fn(),
    useDeleteToken: vi.fn(),
  };
});
vi.mock('../../../hooks/useRepertoireUrl');

import ManageServiceTokens from './ManageServiceTokens';

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

const mockDeleteToken = vi.fn();

describe('ManageServiceTokens', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRepertoireUrl.mockReturnValue(undefined);
    mockUseUserTokens.mockReturnValue(tokensResult(mockServiceTokens));
    mockDeleteToken.mockResolvedValue(undefined);
    mockUseDeleteToken.mockReturnValue({
      deleteToken: mockDeleteToken,
      isDeleting: false,
      error: null,
      reset: vi.fn(),
    });
  });

  it("lists the bot user's service tokens after a valid lookup", async () => {
    const user = userEvent.setup();
    render(<ManageServiceTokens />);

    await user.type(screen.getByLabelText('Bot user'), 'bot-ci');
    await user.click(screen.getByRole('button', { name: /look up tokens/i }));

    expect(await screen.findByText('ci-token')).toBeInTheDocument();
    expect(mockUseUserTokens).toHaveBeenCalledWith('bot-ci', undefined);
  });

  it('rejects a non-bot username with a clear message and issues no request', async () => {
    const user = userEvent.setup();
    render(<ManageServiceTokens />);

    await user.type(screen.getByLabelText('Bot user'), 'alice');
    await user.click(screen.getByRole('button', { name: /look up tokens/i }));

    expect(
      await screen.findByText(/must start with "bot-"/i)
    ).toBeInTheDocument();
    // No token list is rendered and no request is issued for an invalid lookup.
    expect(screen.queryByText('ci-token')).not.toBeInTheDocument();
    expect(mockUseUserTokens).not.toHaveBeenCalled();
  });

  it('shows an empty-state message when the bot user has no service tokens', async () => {
    mockUseUserTokens.mockReturnValue(tokensResult([]));
    const user = userEvent.setup();
    render(<ManageServiceTokens />);

    await user.type(screen.getByLabelText('Bot user'), 'bot-empty');
    await user.click(screen.getByRole('button', { name: /look up tokens/i }));

    expect(await screen.findByText(/no service tokens/i)).toBeInTheDocument();
  });

  it('revokes a service token with a confirmation modal', async () => {
    const user = userEvent.setup();
    render(<ManageServiceTokens />);

    await user.type(screen.getByLabelText('Bot user'), 'bot-ci');
    await user.click(screen.getByRole('button', { name: /look up tokens/i }));

    // Open the confirmation modal from the listed token's Delete button.
    await user.click(await screen.findByRole('button', { name: /delete/i }));
    expect(
      await screen.findByText(/are you sure you want to delete this token/i)
    ).toBeInTheDocument();

    // Confirm the deletion.
    await user.click(screen.getByRole('button', { name: /delete token/i }));

    expect(mockDeleteToken).toHaveBeenCalledWith(
      'bot-ci',
      'gt-service-token-key'
    );
  });
});
