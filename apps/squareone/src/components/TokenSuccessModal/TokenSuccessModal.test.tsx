import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExpirationValue } from '../../lib/tokens/expiration';
import TokenSuccessModal from './TokenSuccessModal';

vi.mock('next/router', () => ({
  useRouter: vi.fn(),
}));

describe('TokenSuccessModal', () => {
  const mockPush = vi.fn();
  const mockOnClose = vi.fn();

  const defaultProps = {
    open: true,
    onClose: mockOnClose,
    token: 'gt-1234567890abcdef',
    tokenName: 'My Test Token',
    scopes: ['read:all', 'user:token'],
    expiration: { type: 'preset', value: '90d' } as ExpirationValue,
    templateUrl:
      'https://example.com/tokens/new?name=My+Test+Token&scope=read%3Aall&scope=user%3Atoken&expiration=90d',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({
      push: mockPush,
    });
    Object.defineProperty(navigator, 'clipboard', {
      writable: true,
      configurable: true,
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
    Object.defineProperty(window, 'isSecureContext', {
      writable: true,
      configurable: true,
      value: true,
    });
  });

  it('renders modal when open', () => {
    render(<TokenSuccessModal {...defaultProps} />);

    expect(screen.getByText('Your new access token')).toBeInTheDocument();
    expect(
      screen.getByText(/Copy this token. It won't be shown again/)
    ).toBeInTheDocument();
  });

  it('does not render modal when closed', () => {
    render(<TokenSuccessModal {...defaultProps} open={false} />);

    expect(screen.queryByText('Your new access token')).not.toBeInTheDocument();
  });

  it('displays the token value in large monospace text', () => {
    render(<TokenSuccessModal {...defaultProps} />);

    expect(screen.getByText('gt-1234567890abcdef')).toBeInTheDocument();
  });

  it('displays inline scope details', () => {
    render(<TokenSuccessModal {...defaultProps} />);

    expect(
      screen.getByText(/Scopes: read:all, user:token/)
    ).toBeInTheDocument();
  });

  it('calls onClose and navigates to tokens list when Done button is clicked', async () => {
    const user = userEvent.setup();
    render(<TokenSuccessModal {...defaultProps} />);

    const doneButton = screen.getByRole('button', { name: 'Done' });
    await user.click(doneButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/settings/tokens');
  });

  it('has copy token button', () => {
    render(<TokenSuccessModal {...defaultProps} />);

    expect(
      screen.getByRole('button', { name: 'Copy token to clipboard' })
    ).toBeInTheDocument();
  });

  it('has copy token template button', () => {
    render(<TokenSuccessModal {...defaultProps} />);

    expect(
      screen.getByRole('button', { name: 'Copy token template to clipboard' })
    ).toBeInTheDocument();
  });

  describe('expiration formatting', () => {
    it('formats never expiration', () => {
      render(
        <TokenSuccessModal {...defaultProps} expiration={{ type: 'never' }} />
      );

      expect(screen.getByText(/Does not expire/)).toBeInTheDocument();
    });

    it('formats 90 day preset with future date', () => {
      render(
        <TokenSuccessModal
          {...defaultProps}
          expiration={{ type: 'preset', value: '90d' }}
        />
      );

      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() + 90);
      const formattedDate = expectedDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

      expect(
        screen.getByText(new RegExp(`Expires on ${formattedDate}`))
      ).toBeInTheDocument();
    });

    it('formats 30 day preset', () => {
      render(
        <TokenSuccessModal
          {...defaultProps}
          expiration={{ type: 'preset', value: '30d' }}
        />
      );

      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() + 30);
      const formattedDate = expectedDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

      expect(
        screen.getByText(new RegExp(`Expires on ${formattedDate}`))
      ).toBeInTheDocument();
    });

    it('formats 7 day preset', () => {
      render(
        <TokenSuccessModal
          {...defaultProps}
          expiration={{ type: 'preset', value: '7d' }}
        />
      );

      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() + 7);
      const formattedDate = expectedDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

      expect(
        screen.getByText(new RegExp(`Expires on ${formattedDate}`))
      ).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has accessible warning message', () => {
      render(<TokenSuccessModal {...defaultProps} />);

      const warning = screen.getByText(
        /Copy this token. It won't be shown again/
      );
      expect(warning).toBeInTheDocument();
    });

    it('has accessible copy button with aria-label', () => {
      render(<TokenSuccessModal {...defaultProps} />);

      expect(
        screen.getByRole('button', { name: 'Copy token to clipboard' })
      ).toBeInTheDocument();
    });
  });

  describe('clipboard functionality', () => {
    it('copies token to clipboard when copy button is clicked', async () => {
      render(<TokenSuccessModal {...defaultProps} />);

      const copyButton = screen.getByRole('button', {
        name: 'Copy token to clipboard',
      });
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
          'gt-1234567890abcdef'
        );
      });
    });

    it('copies template URL to clipboard when copy template button is clicked', async () => {
      render(<TokenSuccessModal {...defaultProps} />);

      const copyButton = screen.getByRole('button', {
        name: 'Copy token template to clipboard',
      });
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
          defaultProps.templateUrl
        );
      });
    });
  });

  it('displays multiple scopes correctly', () => {
    render(
      <TokenSuccessModal
        {...defaultProps}
        scopes={['admin:token', 'exec:notebook', 'read:tap', 'write:notebook']}
      />
    );

    expect(
      screen.getByText(
        /Scopes: admin:token, exec:notebook, read:tap, write:notebook/
      )
    ).toBeInTheDocument();
  });

  describe('focus management', () => {
    it('focuses the token copy button when modal opens', async () => {
      render(<TokenSuccessModal {...defaultProps} />);

      // Wait for the focus effect to complete
      await waitFor(
        () => {
          const copyButton = screen.getByRole('button', {
            name: 'Copy token to clipboard',
          });
          expect(copyButton).toHaveFocus();
        },
        { timeout: 200 }
      );
    });
  });
});
