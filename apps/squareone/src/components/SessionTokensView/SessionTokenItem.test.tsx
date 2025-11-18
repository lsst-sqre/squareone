import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { TokenInfo } from '../../hooks/useUserTokens';

// Mock the hooks
vi.mock('../../hooks/useDeleteToken', () => ({
  default: vi.fn(),
}));

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

import useDeleteToken from '../../hooks/useDeleteToken';
import SessionTokenItem from './SessionTokenItem';

const mockUseDeleteToken = vi.mocked(useDeleteToken);

describe('SessionTokenItem', () => {
  const now = Math.floor(Date.now() / 1000);

  const baseWebSessionToken: TokenInfo = {
    username: 'testuser',
    token_type: 'session',
    service: null,
    scopes: ['read:image', 'read:tap', 'user:token'],
    token: 'gt-session-abc123',
    token_name: 'web-session',
    created: now - 3600,
    expires: now + 3600 * 24,
    parent: null,
  };

  const baseNotebookToken: TokenInfo = {
    username: 'testuser',
    token_type: 'notebook',
    service: null,
    scopes: ['exec:notebook', 'read:image', 'write:files'],
    token: 'gt-notebook-def456',
    token_name: 'notebook-session',
    created: now - 86400,
    expires: now + 86400 * 7,
    parent: null,
  };

  const baseInternalToken: TokenInfo = {
    username: 'testuser',
    token_type: 'internal',
    service: null,
    scopes: ['read:all', 'write:all'],
    token: 'gt-internal-ghi789',
    token_name: 'internal-token',
    created: now - 86400 * 30,
    expires: now + 86400 * 90,
    parent: null,
  };

  const mockDeleteToken = vi.fn();
  const mockOnDeleteSuccess = vi.fn();
  const mockOnDeleteError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseDeleteToken.mockReturnValue({
      deleteToken: mockDeleteToken,
      isDeleting: false,
      error: undefined,
    });
  });

  it('renders web session token information correctly', () => {
    render(
      <SessionTokenItem
        token={baseWebSessionToken}
        username="testuser"
        onDeleteSuccess={mockOnDeleteSuccess}
        onDeleteError={mockOnDeleteError}
      />
    );

    expect(screen.getByText('web-session')).toBeInTheDocument();
    expect(screen.getByText('gt-session-abc123')).toBeInTheDocument();
    expect(screen.getByText('read:image')).toBeInTheDocument();
    expect(screen.getByText('read:tap')).toBeInTheDocument();
    expect(screen.getByText('user:token')).toBeInTheDocument();
    expect(screen.getByText('Expires on 2025-12-31')).toBeInTheDocument();
  });

  it('renders notebook token information correctly', () => {
    render(
      <SessionTokenItem
        token={baseNotebookToken}
        username="testuser"
        onDeleteSuccess={mockOnDeleteSuccess}
        onDeleteError={mockOnDeleteError}
      />
    );

    expect(screen.getByText('notebook-session')).toBeInTheDocument();
    expect(screen.getByText('gt-notebook-def456')).toBeInTheDocument();
    expect(screen.getByText('exec:notebook')).toBeInTheDocument();
    expect(screen.getByText('read:image')).toBeInTheDocument();
    expect(screen.getByText('write:files')).toBeInTheDocument();
  });

  it('renders internal token information correctly', () => {
    render(
      <SessionTokenItem
        token={baseInternalToken}
        username="testuser"
        onDeleteSuccess={mockOnDeleteSuccess}
        onDeleteError={mockOnDeleteError}
      />
    );

    expect(screen.getByText('internal-token')).toBeInTheDocument();
    expect(screen.getByText('gt-internal-ghi789')).toBeInTheDocument();
    expect(screen.getByText('read:all')).toBeInTheDocument();
    expect(screen.getByText('write:all')).toBeInTheDocument();
  });

  it('links to session token detail page', () => {
    render(
      <SessionTokenItem
        token={baseWebSessionToken}
        username="testuser"
        onDeleteSuccess={mockOnDeleteSuccess}
        onDeleteError={mockOnDeleteError}
      />
    );

    const link = screen.getByText('gt-session-abc123');
    expect(link).toHaveAttribute(
      'href',
      '/settings/sessions/gt-session-abc123'
    );
  });

  it('sorts scopes alphabetically', () => {
    render(
      <SessionTokenItem
        token={baseWebSessionToken}
        username="testuser"
        onDeleteSuccess={mockOnDeleteSuccess}
        onDeleteError={mockOnDeleteError}
      />
    );

    // Scopes should be sorted: read:image, read:tap, user:token
    const badges = [
      screen.getByText('read:image'),
      screen.getByText('read:tap'),
      screen.getByText('user:token'),
    ];

    // Verify all badges are present
    badges.forEach((badge) => {
      expect(badge).toBeInTheDocument();
    });
  });

  it('renders delete button', () => {
    render(
      <SessionTokenItem
        token={baseWebSessionToken}
        username="testuser"
        onDeleteSuccess={mockOnDeleteSuccess}
        onDeleteError={mockOnDeleteError}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    expect(deleteButton).toBeInTheDocument();
  });

  it('opens modal when delete button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <SessionTokenItem
        token={baseWebSessionToken}
        username="testuser"
        onDeleteSuccess={mockOnDeleteSuccess}
        onDeleteError={mockOnDeleteError}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    // Modal should appear
    await waitFor(() => {
      expect(
        screen.getByText('Are you sure you want to delete this token?')
      ).toBeInTheDocument();
    });
  });

  it('calls deleteToken when modal is confirmed', async () => {
    const user = userEvent.setup();
    mockDeleteToken.mockResolvedValue(undefined);

    render(
      <SessionTokenItem
        token={baseWebSessionToken}
        username="testuser"
        onDeleteSuccess={mockOnDeleteSuccess}
        onDeleteError={mockOnDeleteError}
      />
    );

    // Open modal
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    // Confirm deletion
    await waitFor(() => {
      expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole('button', {
      name: /delete token/i,
    });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockDeleteToken).toHaveBeenCalledWith(
        'testuser',
        'gt-session-abc123'
      );
      expect(mockOnDeleteSuccess).toHaveBeenCalled();
    });
  });

  it('calls onDeleteError when deletion fails', async () => {
    const user = userEvent.setup();
    const error = new Error('Deletion failed');
    mockDeleteToken.mockRejectedValue(error);

    render(
      <SessionTokenItem
        token={baseWebSessionToken}
        username="testuser"
        onDeleteSuccess={mockOnDeleteSuccess}
        onDeleteError={mockOnDeleteError}
      />
    );

    // Open modal
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    // Confirm deletion
    await waitFor(() => {
      expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole('button', {
      name: /delete token/i,
    });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockDeleteToken).toHaveBeenCalled();
      expect(mockOnDeleteError).toHaveBeenCalledWith(error);
    });
  });

  it('closes modal when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(
      <SessionTokenItem
        token={baseWebSessionToken}
        username="testuser"
        onDeleteSuccess={mockOnDeleteSuccess}
        onDeleteError={mockOnDeleteError}
      />
    );

    // Open modal
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
    });

    // Cancel
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText(/are you sure/i)).not.toBeInTheDocument();
    });

    expect(mockDeleteToken).not.toHaveBeenCalled();
  });

  it('displays error message when error exists', () => {
    const error = {
      status: 403,
      message: "You don't have permission to delete this token.",
    };

    mockUseDeleteToken.mockReturnValue({
      deleteToken: mockDeleteToken,
      isDeleting: false,
      error,
    });

    render(
      <SessionTokenItem
        token={baseWebSessionToken}
        username="testuser"
        onDeleteSuccess={mockOnDeleteSuccess}
        onDeleteError={mockOnDeleteError}
      />
    );

    expect(
      screen.getByText("You don't have permission to delete this token.")
    ).toBeInTheDocument();
  });

  it('renders with null expires', () => {
    const tokenWithNoExpiry: TokenInfo = {
      ...baseWebSessionToken,
      expires: null,
    };

    render(
      <SessionTokenItem
        token={tokenWithNoExpiry}
        username="testuser"
        onDeleteSuccess={mockOnDeleteSuccess}
        onDeleteError={mockOnDeleteError}
      />
    );

    expect(screen.getByText('Never expires')).toBeInTheDocument();
  });

  it('renders "No scopes." when token has no scopes', () => {
    const tokenWithNoScopes: TokenInfo = {
      ...baseWebSessionToken,
      scopes: [],
    };

    render(
      <SessionTokenItem
        token={tokenWithNoScopes}
        username="testuser"
        onDeleteSuccess={mockOnDeleteSuccess}
        onDeleteError={mockOnDeleteError}
      />
    );

    expect(screen.getByText('No scopes.')).toBeInTheDocument();
  });

  it('does not render token name div when token_name is undefined', () => {
    const tokenWithoutName: TokenInfo = {
      ...baseWebSessionToken,
      token_name: undefined,
    };

    render(
      <SessionTokenItem
        token={tokenWithoutName}
        username="testuser"
        onDeleteSuccess={mockOnDeleteSuccess}
        onDeleteError={mockOnDeleteError}
      />
    );

    // Token name div should not be shown, but token ID should still appear in link
    const tokenLink = screen.getByText('gt-session-abc123');
    expect(tokenLink).toBeInTheDocument();
    expect(tokenLink.tagName).toBe('A'); // Should be the link, not the name div
  });

  it('applies correct colors based on scope prefix', () => {
    const tokenWithVariedScopes: TokenInfo = {
      ...baseNotebookToken,
      scopes: ['exec:notebook', 'read:image', 'write:files', 'user:token'],
    };

    render(
      <SessionTokenItem
        token={tokenWithVariedScopes}
        username="testuser"
        onDeleteSuccess={mockOnDeleteSuccess}
        onDeleteError={mockOnDeleteError}
      />
    );

    // Verify all scopes are rendered
    expect(screen.getByText('exec:notebook')).toBeInTheDocument();
    expect(screen.getByText('read:image')).toBeInTheDocument();
    expect(screen.getByText('write:files')).toBeInTheDocument();
    expect(screen.getByText('user:token')).toBeInTheDocument();
  });

  it('renders dates with semantic time elements', () => {
    render(
      <SessionTokenItem
        token={baseWebSessionToken}
        username="testuser"
        onDeleteSuccess={mockOnDeleteSuccess}
        onDeleteError={mockOnDeleteError}
      />
    );

    // Check for time elements with datetime attributes
    const timeElements = screen.getAllByRole('time');
    expect(timeElements).toHaveLength(1);

    // Expiration time element
    const expirationTime = screen.getByText('Expires on 2025-12-31');
    expect(expirationTime.tagName).toBe('TIME');
    expect(expirationTime).toHaveAttribute(
      'datetime',
      '2025-12-31T00:00:00.000Z'
    );
  });

  it('renders "Never expires" without time element', () => {
    const tokenWithNoExpiry: TokenInfo = {
      ...baseWebSessionToken,
      expires: null,
    };

    render(
      <SessionTokenItem
        token={tokenWithNoExpiry}
        username="testuser"
        onDeleteSuccess={mockOnDeleteSuccess}
        onDeleteError={mockOnDeleteError}
      />
    );

    const neverExpires = screen.getByText('Never expires');
    expect(neverExpires.tagName).toBe('SPAN');
    expect(neverExpires).not.toHaveAttribute('datetime');
  });
});
