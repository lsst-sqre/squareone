import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { Scope } from '../TokenForm';
import ServiceTokenForm from './ServiceTokenForm';

const mockScopes: Scope[] = [
  { name: 'read:tap', description: 'Read access to the TAP service' },
  { name: 'exec:notebook', description: 'Can execute notebooks' },
  { name: 'admin:token', description: 'Can manage all tokens' },
];

const defaultProps = {
  availableScopes: mockScopes,
  onSubmit: vi.fn().mockResolvedValue(undefined),
  isSubmitting: false,
};

describe('ServiceTokenForm', () => {
  it('renders the username, name, scope, and expiration fields', () => {
    render(<ServiceTokenForm {...defaultProps} />);

    expect(screen.getByLabelText(/bot username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/token name/i)).toBeInTheDocument();
    expect(screen.getByText(/token scopes/i)).toBeInTheDocument();
    expect(screen.getByText(/token expiration/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /create service token/i })
    ).toBeInTheDocument();
  });

  it('offers every configured scope, not just a subset', () => {
    render(<ServiceTokenForm {...defaultProps} />);

    for (const scope of mockScopes) {
      expect(screen.getByLabelText(new RegExp(scope.name))).toBeInTheDocument();
    }
  });

  it('defaults the expiration to never', () => {
    render(<ServiceTokenForm {...defaultProps} />);

    expect(screen.getByRole('combobox')).toHaveTextContent(/never/i);
  });

  it('rejects a username that is missing the bot- prefix before submit', async () => {
    const user = userEvent.setup({ delay: 10 });
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ServiceTokenForm {...defaultProps} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/bot username/i), 'alice');
    await user.type(screen.getByLabelText(/token name/i), 'CI token');
    await user.click(screen.getByLabelText(/read:tap/i));
    await user.click(
      screen.getByRole('button', { name: /create service token/i })
    );

    await waitFor(() => {
      expect(screen.getByText(/must start with "bot-"/i)).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rejects a bot- username that violates the Gafaelfawr regex', async () => {
    const user = userEvent.setup({ delay: 10 });
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ServiceTokenForm {...defaultProps} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/bot username/i), 'bot-Bad');
    await user.type(screen.getByLabelText(/token name/i), 'CI token');
    await user.click(screen.getByLabelText(/read:tap/i));
    await user.click(
      screen.getByRole('button', { name: /create service token/i })
    );

    await waitFor(() => {
      expect(
        screen.getByText(/only lowercase letters, digits, and single/i)
      ).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('requires at least one scope', async () => {
    const user = userEvent.setup({ delay: 10 });
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ServiceTokenForm {...defaultProps} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/bot username/i), 'bot-ci');
    await user.type(screen.getByLabelText(/token name/i), 'CI token');
    await user.click(
      screen.getByRole('button', { name: /create service token/i })
    );

    await waitFor(() => {
      expect(
        screen.getByText(/at least one scope must be selected/i)
      ).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('requires a token name', async () => {
    const user = userEvent.setup({ delay: 10 });
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ServiceTokenForm {...defaultProps} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/bot username/i), 'bot-ci');
    await user.click(screen.getByLabelText(/read:tap/i));
    await user.click(
      screen.getByRole('button', { name: /create service token/i })
    );

    await waitFor(() => {
      expect(screen.getByText(/token name is required/i)).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits the entered values with a never expiration by default', async () => {
    const user = userEvent.setup({ delay: 10 });
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ServiceTokenForm {...defaultProps} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/bot username/i), 'bot-ci');
    await user.type(screen.getByLabelText(/token name/i), 'CI token');
    await user.click(screen.getByLabelText(/read:tap/i));
    await user.click(
      screen.getByRole('button', { name: /create service token/i })
    );

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        username: 'bot-ci',
        name: 'CI token',
        scopes: ['read:tap'],
        expiration: { type: 'never' },
      });
    });
  });

  it('disables the form while submitting', () => {
    render(<ServiceTokenForm {...defaultProps} isSubmitting={true} />);

    expect(screen.getByLabelText(/bot username/i)).toBeDisabled();
    expect(screen.getByLabelText(/token name/i)).toBeDisabled();
    expect(
      screen.getByRole('button', { name: /create service token/i })
    ).toBeDisabled();
  });
});
