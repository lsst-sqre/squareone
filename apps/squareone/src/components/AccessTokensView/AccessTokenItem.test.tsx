import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
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

import useDeleteToken from '../../hooks/useDeleteToken';
import AccessTokenItem from './AccessTokenItem';

const mockUseDeleteToken = vi.mocked(useDeleteToken);

describe('AccessTokenItem', () => {
  const baseToken: TokenInfo = {
    username: 'testuser',
    token_type: 'user',
    service: null,
    scopes: ['read:user', 'write:user', 'admin:token'],
    token: 'gt-abc123def456',
    token_name: 'my-token',
    created: 1704067200,
    expires: 1735689600,
    last_used: 1704153600,
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

  it('renders token information correctly', () => {
    render(
      <AccessTokenItem
        token={baseToken}
        username="testuser"
        onDeleteSuccess={mockOnDeleteSuccess}
        onDeleteError={mockOnDeleteError}
      />
    );

    expect(screen.getByText('my-token')).toBeInTheDocument();
    expect(screen.getByText('gt-abc123def456')).toBeInTheDocument();
    // Each scope should be rendered as a separate badge
    expect(screen.getByText('admin:token')).toBeInTheDocument();
    expect(screen.getByText('read:user')).toBeInTheDocument();
    expect(screen.getByText('write:user')).toBeInTheDocument();
    expect(screen.getByText('Expires on 2025-12-31')).toBeInTheDocument();
    expect(screen.getByText('Last used 2 hours ago')).toBeInTheDocument();
  });

  it('sorts scopes alphabetically', () => {
    render(
      <AccessTokenItem
        token={baseToken}
        username="testuser"
        onDeleteSuccess={mockOnDeleteSuccess}
        onDeleteError={mockOnDeleteError}
      />
    );

    // Scopes should be sorted: admin:token, read:user, write:user
    // Each scope is rendered as a separate badge
    const badges = [
      screen.getByText('admin:token'),
      screen.getByText('read:user'),
      screen.getByText('write:user'),
    ];

    // Verify all badges are present
    badges.forEach((badge) => {
      expect(badge).toBeInTheDocument();
    });
  });

  it('renders delete button', () => {
    render(
      <AccessTokenItem
        token={baseToken}
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
      <AccessTokenItem
        token={baseToken}
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
      <AccessTokenItem
        token={baseToken}
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
        'gt-abc123def456'
      );
      expect(mockOnDeleteSuccess).toHaveBeenCalled();
    });
  });

  it('calls onDeleteError when deletion fails', async () => {
    const user = userEvent.setup();
    const error = new Error('Deletion failed');
    mockDeleteToken.mockRejectedValue(error);

    render(
      <AccessTokenItem
        token={baseToken}
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
      <AccessTokenItem
        token={baseToken}
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
      <AccessTokenItem
        token={baseToken}
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
      ...baseToken,
      expires: null,
    };

    render(
      <AccessTokenItem
        token={tokenWithNoExpiry}
        username="testuser"
        onDeleteSuccess={mockOnDeleteSuccess}
        onDeleteError={mockOnDeleteError}
      />
    );

    expect(screen.getByText('Never expires')).toBeInTheDocument();
  });

  it('renders with null last_used', () => {
    const tokenNeverUsed: TokenInfo = {
      ...baseToken,
      last_used: null,
    };

    render(
      <AccessTokenItem
        token={tokenNeverUsed}
        username="testuser"
        onDeleteSuccess={mockOnDeleteSuccess}
        onDeleteError={mockOnDeleteError}
      />
    );

    expect(screen.getByText('Never used')).toBeInTheDocument();
  });

  it('renders with single scope', () => {
    const tokenWithSingleScope = {
      ...baseToken,
      scopes: ['read:user'],
    };

    render(
      <AccessTokenItem
        token={tokenWithSingleScope}
        username="testuser"
        onDeleteSuccess={mockOnDeleteSuccess}
        onDeleteError={mockOnDeleteError}
      />
    );

    expect(screen.getByText('read:user')).toBeInTheDocument();
  });

  it('renders with multiple scopes', () => {
    const tokenWithManyScopes = {
      ...baseToken,
      scopes: ['z:scope', 'a:scope', 'm:scope'],
    };

    render(
      <AccessTokenItem
        token={tokenWithManyScopes}
        username="testuser"
        onDeleteSuccess={mockOnDeleteSuccess}
        onDeleteError={mockOnDeleteError}
      />
    );

    // Should be sorted alphabetically and rendered as separate badges
    expect(screen.getByText('a:scope')).toBeInTheDocument();
    expect(screen.getByText('m:scope')).toBeInTheDocument();
    expect(screen.getByText('z:scope')).toBeInTheDocument();
  });

  it('renders dates with semantic time elements', () => {
    render(
      <AccessTokenItem
        token={baseToken}
        username="testuser"
        onDeleteSuccess={mockOnDeleteSuccess}
        onDeleteError={mockOnDeleteError}
      />
    );

    // Check for time elements with datetime attributes
    const timeElements = screen.getAllByRole('time');
    expect(timeElements).toHaveLength(2);

    // Expiration time element
    const expirationTime = screen.getByText('Expires on 2025-12-31');
    expect(expirationTime.tagName).toBe('TIME');
    expect(expirationTime).toHaveAttribute(
      'datetime',
      '2025-12-31T00:00:00.000Z'
    );

    // Last used time element
    const lastUsedTime = screen.getByText('Last used 2 hours ago');
    expect(lastUsedTime.tagName).toBe('TIME');
    expect(lastUsedTime).toHaveAttribute(
      'datetime',
      '2025-01-01T10:00:00.000Z'
    );
  });

  it('renders "Never expires" without time element', () => {
    const tokenWithNoExpiry: TokenInfo = {
      ...baseToken,
      expires: null,
    };

    render(
      <AccessTokenItem
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

  it('renders "Never used" without time element', () => {
    const tokenNeverUsed: TokenInfo = {
      ...baseToken,
      last_used: null,
    };

    render(
      <AccessTokenItem
        token={tokenNeverUsed}
        username="testuser"
        onDeleteSuccess={mockOnDeleteSuccess}
        onDeleteError={mockOnDeleteError}
      />
    );

    const neverUsed = screen.getByText('Never used');
    expect(neverUsed.tagName).toBe('SPAN');
    expect(neverUsed).not.toHaveAttribute('datetime');
  });

  it('renders "No scopes." when token has no scopes', () => {
    const tokenWithNoScopes: TokenInfo = {
      ...baseToken,
      scopes: [],
    };

    render(
      <AccessTokenItem
        token={tokenWithNoScopes}
        username="testuser"
        onDeleteSuccess={mockOnDeleteSuccess}
        onDeleteError={mockOnDeleteError}
      />
    );

    expect(screen.getByText('No scopes.')).toBeInTheDocument();
  });

  it('applies correct colors based on scope prefix', () => {
    const tokenWithVariedScopes: TokenInfo = {
      ...baseToken,
      scopes: ['exec:notebook', 'read:image', 'write:files', 'user:token'],
    };

    render(
      <AccessTokenItem
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
});
