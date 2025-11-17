import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import DeleteTokenModal from './DeleteTokenModal';

describe('DeleteTokenModal', () => {
  const mockOnConfirm = vi.fn();
  const mockOnCancel = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    render(
      <DeleteTokenModal
        isOpen={false}
        tokenName="test-token"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        isDeleting={false}
      />
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders modal content when isOpen is true', () => {
    render(
      <DeleteTokenModal
        isOpen={true}
        tokenName="test-token"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        isDeleting={false}
      />
    );

    expect(
      screen.getByText('Are you sure you want to delete this token?')
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Any applications using access token test-token/i)
    ).toBeInTheDocument();
  });

  it('calls onCancel when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <DeleteTokenModal
        isOpen={true}
        tokenName="test-token"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        isDeleting={false}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it('calls onConfirm when Delete button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <DeleteTokenModal
        isOpen={true}
        tokenName="test-token"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        isDeleting={false}
      />
    );

    const deleteButton = screen.getByRole('button', {
      name: /delete token/i,
    });
    await user.click(deleteButton);
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnCancel).not.toHaveBeenCalled();
  });

  it('shows loading state when isDeleting is true', () => {
    render(
      <DeleteTokenModal
        isOpen={true}
        tokenName="test-token"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        isDeleting={true}
      />
    );

    const deleteButton = screen.getByRole('button', {
      name: /delete token/i,
    });
    expect(deleteButton).toHaveAttribute('aria-busy', 'true');
  });

  it('disables buttons when isDeleting is true', () => {
    render(
      <DeleteTokenModal
        isOpen={true}
        tokenName="test-token"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        isDeleting={true}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    const deleteButton = screen.getByRole('button', {
      name: /delete token/i,
    });

    expect(cancelButton).toBeDisabled();
    expect(deleteButton).toBeDisabled();
  });

  it('hides close button when isDeleting is true', () => {
    const { rerender } = render(
      <DeleteTokenModal
        isOpen={true}
        tokenName="test-token"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        isDeleting={false}
      />
    );

    // Close button should be present initially
    expect(screen.getByLabelText(/close/i)).toBeInTheDocument();

    // Rerender with isDeleting=true
    rerender(
      <DeleteTokenModal
        isOpen={true}
        tokenName="test-token"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        isDeleting={true}
      />
    );

    // Close button should not be present
    expect(screen.queryByLabelText(/close/i)).not.toBeInTheDocument();
  });

  it('renders with dialog role', () => {
    render(
      <DeleteTokenModal
        isOpen={true}
        tokenName="test-token"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        isDeleting={false}
      />
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
  });
});
