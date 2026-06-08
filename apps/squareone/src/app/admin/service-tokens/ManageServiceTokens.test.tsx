import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

import ManageServiceTokens from './ManageServiceTokens';

describe('ManageServiceTokens', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('navigates to the /search page with the bot username as ?q=', async () => {
    const user = userEvent.setup();
    render(<ManageServiceTokens />);

    await user.type(screen.getByLabelText('Bot user'), 'bot-ci');
    await user.click(screen.getByRole('button', { name: /look up tokens/i }));

    expect(mockPush).toHaveBeenCalledWith(
      '/admin/service-tokens/search?q=bot-ci'
    );
  });

  it('trims surrounding whitespace before building the search URL', async () => {
    const user = userEvent.setup();
    render(<ManageServiceTokens />);

    await user.type(screen.getByLabelText('Bot user'), '  bot-ci  ');
    await user.click(screen.getByRole('button', { name: /look up tokens/i }));

    expect(mockPush).toHaveBeenCalledWith(
      '/admin/service-tokens/search?q=bot-ci'
    );
  });

  it('URL-encodes the bot username in the search URL', async () => {
    const user = userEvent.setup();
    render(<ManageServiceTokens />);

    // A space inside the entry must be percent-encoded, not passed through raw.
    await user.type(screen.getByLabelText('Bot user'), 'bot ci');
    await user.click(screen.getByRole('button', { name: /look up tokens/i }));

    expect(mockPush).toHaveBeenCalledWith(
      '/admin/service-tokens/search?q=bot%20ci'
    );
  });

  it('renders no inline token list (lookup happens on the /search page)', async () => {
    const user = userEvent.setup();
    render(<ManageServiceTokens />);

    await user.type(screen.getByLabelText('Bot user'), 'bot-ci');
    await user.click(screen.getByRole('button', { name: /look up tokens/i }));

    // The landing only redirects now; it never lists tokens inline.
    expect(screen.queryByText('ci-token')).not.toBeInTheDocument();
  });
});
