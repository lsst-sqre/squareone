import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { Scope } from './ScopeSelector';
import TokenForm from './TokenForm';

const mockScopes: Scope[] = [
  {
    name: 'read:all',
    description: 'Read access to all services',
  },
  {
    name: 'user:token',
    description: 'Can create and modify user tokens',
  },
];

const defaultProps = {
  availableScopes: mockScopes,
  onSubmit: vi.fn(),
  onCancel: vi.fn(),
  isSubmitting: false,
};

describe('TokenForm', () => {
  it('should render form elements', () => {
    render(<TokenForm {...defaultProps} />);

    expect(screen.getByLabelText(/token name/i)).toBeInTheDocument();
    expect(screen.getByText(/token scopes/i)).toBeInTheDocument();
    expect(screen.getByText(/token expiration/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /create token/i })
    ).toBeInTheDocument();
  });

  it('should show validation error for empty token name', async () => {
    const user = userEvent.setup({ delay: 10 });
    render(<TokenForm {...defaultProps} />);

    const submitButton = screen.getByRole('button', { name: /create token/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/token name is required/i)).toBeInTheDocument();
    });
  });

  it('should show validation error when no scopes selected', async () => {
    const user = userEvent.setup({ delay: 10 });
    render(<TokenForm {...defaultProps} />);

    const nameInput = screen.getByLabelText(/token name/i);
    await user.type(nameInput, 'Test Token');

    const submitButton = screen.getByRole('button', { name: /create token/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/at least one scope must be selected/i)
      ).toBeInTheDocument();
    });
  });

  it('should call onSubmit with form values when valid', async () => {
    const user = userEvent.setup({ delay: 10 });
    const mockOnSubmit = vi.fn().mockResolvedValue(undefined);

    render(<TokenForm {...defaultProps} onSubmit={mockOnSubmit} />);

    // Fill in form
    const nameInput = screen.getByLabelText(/token name/i);
    await user.type(nameInput, 'Test Token');

    const scopeCheckbox = screen.getByLabelText(/read:all/i);
    await user.click(scopeCheckbox);

    const submitButton = screen.getByRole('button', { name: /create token/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'Test Token',
        scopes: ['read:all'],
        expiration: { type: 'preset', value: '90d' }, // default
      });
    });
  });

  it('should call onCancel when cancel button clicked', async () => {
    const user = userEvent.setup({ delay: 10 });
    const mockOnCancel = vi.fn();

    render(<TokenForm {...defaultProps} onCancel={mockOnCancel} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should disable form elements when submitting', () => {
    render(<TokenForm {...defaultProps} isSubmitting={true} />);

    expect(screen.getByLabelText(/token name/i)).toBeDisabled();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
    expect(
      screen.getByRole('button', { name: /create token/i })
    ).toBeDisabled();
  });

  it('should prefill form with initial values', () => {
    const initialValues = {
      name: 'Prefilled Token',
      scopes: ['read:all'],
      expiration: { type: 'preset' as const, value: '7d' as const },
    };

    render(<TokenForm {...defaultProps} initialValues={initialValues} />);

    expect(screen.getByDisplayValue('Prefilled Token')).toBeInTheDocument();
    expect(screen.getByLabelText(/read:all/i)).toBeChecked();
    // The expiration selector is now a Select component, check for the displayed value
    expect(screen.getByRole('combobox', { name: /7d/i })).toBeInTheDocument();
  });

  it('should validate token name length', async () => {
    const user = userEvent.setup({ delay: 10 });
    render(<TokenForm {...defaultProps} />);

    const nameInput = screen.getByLabelText(/token name/i);
    const longName = 'a'.repeat(65); // Over 64 character limit
    await user.type(nameInput, longName);

    const submitButton = screen.getByRole('button', {
      name: /create token/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/token name must be 64 characters or less/i)
      ).toBeInTheDocument();
    });
  }, 10000); // Increased timeout to 10s for typing 65 characters

  it('should allow multiple scope selection', async () => {
    const user = userEvent.setup({ delay: 10 });
    const mockOnSubmit = vi.fn().mockResolvedValue(undefined);

    render(<TokenForm {...defaultProps} onSubmit={mockOnSubmit} />);

    const nameInput = screen.getByLabelText(/token name/i);
    await user.type(nameInput, 'Multi-scope Token');

    const readAllCheckbox = screen.getByLabelText(/read:all/i);
    const userTokenCheckbox = screen.getByLabelText(/user:token/i);

    await user.click(readAllCheckbox);
    await user.click(userTokenCheckbox);

    const submitButton = screen.getByRole('button', { name: /create token/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'Multi-scope Token',
        scopes: ['read:all', 'user:token'],
        expiration: { type: 'preset', value: '90d' },
      });
    });
  });

  it('should show validation error for duplicate token name', async () => {
    const user = userEvent.setup({ delay: 10 });
    const existingTokenNames = ['existing token', 'another token'];

    render(
      <TokenForm {...defaultProps} existingTokenNames={existingTokenNames} />
    );

    const nameInput = screen.getByLabelText(/token name/i);
    await user.type(nameInput, 'existing token');

    // Trigger blur to validate immediately
    await user.tab();

    await waitFor(() => {
      expect(
        screen.getByText(/a token with this name already exists/i)
      ).toBeInTheDocument();
    });
  });

  it('should disable submit button when token name is invalid', async () => {
    const user = userEvent.setup({ delay: 10 });
    const existingTokenNames = ['existing token'];

    render(
      <TokenForm {...defaultProps} existingTokenNames={existingTokenNames} />
    );

    const nameInput = screen.getByLabelText(/token name/i);
    const submitButton = screen.getByRole('button', { name: /create token/i });

    // Initially should be enabled (name is empty but valid)
    expect(submitButton).toBeEnabled();

    await user.type(nameInput, 'existing token');
    await user.tab(); // Trigger validation

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it('should validate token name case insensitively', async () => {
    const user = userEvent.setup({ delay: 10 });
    const existingTokenNames = ['existing token'];

    render(
      <TokenForm {...defaultProps} existingTokenNames={existingTokenNames} />
    );

    const nameInput = screen.getByLabelText(/token name/i);
    await user.type(nameInput, 'EXISTING TOKEN');
    await user.tab();

    await waitFor(() => {
      expect(
        screen.getByText(/a token with this name already exists/i)
      ).toBeInTheDocument();
    });
  });

  it('should allow unique token names', async () => {
    const user = userEvent.setup({ delay: 10 });
    const existingTokenNames = ['existing token', 'another token'];

    render(
      <TokenForm {...defaultProps} existingTokenNames={existingTokenNames} />
    );

    const nameInput = screen.getByLabelText(/token name/i);
    const submitButton = screen.getByRole('button', { name: /create token/i });

    await user.type(nameInput, 'unique token name');
    await user.tab();

    // Should not show any validation error
    expect(
      screen.queryByText(/a token with this name already exists/i)
    ).not.toBeInTheDocument();

    // Submit button should remain enabled for name validation
    expect(submitButton).toBeEnabled();
  });
});
