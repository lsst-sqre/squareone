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
  it('renders the username, scope, and expiration fields', () => {
    render(<ServiceTokenForm {...defaultProps} />);

    expect(screen.getByLabelText(/bot username/i)).toBeInTheDocument();
    expect(screen.getByText(/token scopes/i)).toBeInTheDocument();
    expect(screen.getByText(/token expiration/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /create service token/i })
    ).toBeInTheDocument();
  });

  it('does not render a token name field (the service path rejects it)', () => {
    render(<ServiceTokenForm {...defaultProps} />);

    expect(screen.queryByLabelText(/token name/i)).not.toBeInTheDocument();
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

  it('shows the bot username error on blur, before submit', async () => {
    const user = userEvent.setup({ delay: 10 });
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ServiceTokenForm {...defaultProps} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/bot username/i), 'alice');
    // Move focus off the field to trigger on-blur validation.
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/must start with "bot-"/i)).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('trims surrounding whitespace from the username without a spurious error', async () => {
    const user = userEvent.setup({ delay: 10 });
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ServiceTokenForm {...defaultProps} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/bot username/i), '  bot-ci  ');
    await user.tab();

    // The stray whitespace must not produce a confusing regex error.
    await waitFor(() => {
      expect(
        screen.queryByText(/only lowercase letters, digits, and single/i)
      ).not.toBeInTheDocument();
    });

    await user.click(screen.getByLabelText(/read:tap/i));
    await user.click(
      screen.getByRole('button', { name: /create service token/i })
    );

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ username: 'bot-ci' })
      );
    });
  });

  it('requires at least one scope', async () => {
    const user = userEvent.setup({ delay: 10 });
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ServiceTokenForm {...defaultProps} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/bot username/i), 'bot-ci');
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

  it('submits the entered values with a never expiration by default', async () => {
    const user = userEvent.setup({ delay: 10 });
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ServiceTokenForm {...defaultProps} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/bot username/i), 'bot-ci');
    await user.click(screen.getByLabelText(/read:tap/i));
    await user.click(
      screen.getByRole('button', { name: /create service token/i })
    );

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        username: 'bot-ci',
        scopes: ['read:tap'],
        expiration: { type: 'never' },
        // No advanced metadata supplied, so the metadata object is empty.
        metadata: {},
      });
    });
  });

  it('renders a collapsible Advanced settings section, collapsed by default', () => {
    render(<ServiceTokenForm {...defaultProps} />);

    const summary = screen.getByText(/advanced settings/i);
    expect(summary).toBeInTheDocument();
    expect(summary.closest('details')).not.toHaveAttribute('open');
  });

  it('renders the optional metadata fields', () => {
    render(<ServiceTokenForm {...defaultProps} />);

    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('UID')).toBeInTheDocument();
    expect(screen.getByLabelText('GID')).toBeInTheDocument();
    expect(screen.getByLabelText('Groups')).toBeInTheDocument();
  });

  it('renders the Groups textarea full-width so it fills its column', () => {
    render(<ServiceTokenForm {...defaultProps} />);

    // The squared TextArea container is inline-block by default and only fills
    // its column (display:block; width:100%) via the fullWidth prop, so the
    // textarea no longer overflows. The container is the textarea's parent.
    const groups = screen.getByLabelText('Groups');
    expect(groups.parentElement?.className).toMatch(/fullWidth/i);
  });

  it('includes supplied advanced metadata in the submitted values', async () => {
    const user = userEvent.setup({ delay: 10 });
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ServiceTokenForm {...defaultProps} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/bot username/i), 'bot-ci');
    await user.click(screen.getByLabelText(/read:tap/i));
    await user.type(screen.getByLabelText('Name'), 'CI Bot');
    await user.type(screen.getByLabelText('Email'), 'ci@example.com');
    await user.type(screen.getByLabelText('UID'), '90000');
    await user.type(screen.getByLabelText('GID'), '90001');
    await user.type(screen.getByLabelText('Groups'), 'g_developers:1001');
    await user.click(
      screen.getByRole('button', { name: /create service token/i })
    );

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        username: 'bot-ci',
        scopes: ['read:tap'],
        expiration: { type: 'never' },
        metadata: {
          name: 'CI Bot',
          email: 'ci@example.com',
          uid: 90000,
          gid: 90001,
          groups: [{ name: 'g_developers', id: 1001 }],
        },
      });
    });
  });

  it('pre-fills the core fields from initialValues', () => {
    render(
      <ServiceTokenForm
        {...defaultProps}
        initialValues={{
          username: 'bot-seed',
          scopes: ['read:tap'],
          expiration: { type: 'preset', value: '7d' },
        }}
      />
    );

    expect(screen.getByLabelText(/bot username/i)).toHaveValue('bot-seed');
    expect(screen.getByLabelText(/read:tap/i)).toBeChecked();
    expect(screen.getByRole('combobox')).toHaveTextContent(/7 days/i);
  });

  it('pre-fills the Advanced-settings fields from initialValues.metadata', () => {
    render(
      <ServiceTokenForm
        {...defaultProps}
        initialValues={{
          metadata: {
            name: 'CI Bot',
            email: 'ci@example.com',
            uid: '90000',
            gid: '90001',
            groups: 'g_developers:1001\ng_ops:1002',
          },
        }}
      />
    );

    expect(screen.getByLabelText('Name')).toHaveValue('CI Bot');
    expect(screen.getByLabelText('Email')).toHaveValue('ci@example.com');
    expect(screen.getByLabelText('UID')).toHaveValue('90000');
    expect(screen.getByLabelText('GID')).toHaveValue('90001');
    expect(screen.getByLabelText('Groups')).toHaveValue(
      'g_developers:1001\ng_ops:1002'
    );
  });

  it('leaves metadata fields omitted from initialValues at their empty defaults', () => {
    render(
      <ServiceTokenForm
        {...defaultProps}
        initialValues={{ metadata: { name: 'Only Name' } }}
      />
    );

    expect(screen.getByLabelText('Name')).toHaveValue('Only Name');
    expect(screen.getByLabelText('Email')).toHaveValue('');
    expect(screen.getByLabelText('UID')).toHaveValue('');
    expect(screen.getByLabelText('GID')).toHaveValue('');
    expect(screen.getByLabelText('Groups')).toHaveValue('');
  });

  it('rejects malformed groups metadata before submit', async () => {
    const user = userEvent.setup({ delay: 10 });
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ServiceTokenForm {...defaultProps} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/bot username/i), 'bot-ci');
    await user.click(screen.getByLabelText(/read:tap/i));
    await user.type(screen.getByLabelText('Groups'), 'g_developers');
    await user.click(
      screen.getByRole('button', { name: /create service token/i })
    );

    await waitFor(() => {
      expect(screen.getByText(/each group must be/i)).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('disables the form while submitting', () => {
    render(<ServiceTokenForm {...defaultProps} isSubmitting={true} />);

    expect(screen.getByLabelText(/bot username/i)).toBeDisabled();
    expect(
      screen.getByRole('button', { name: /create service token/i })
    ).toBeDisabled();
  });

  it('disables every field and the submit button when disabled is set', () => {
    render(<ServiceTokenForm {...defaultProps} disabled={true} />);

    expect(screen.getByLabelText(/bot username/i)).toBeDisabled();
    expect(screen.getByLabelText('Name')).toBeDisabled();
    expect(screen.getByLabelText('UID')).toBeDisabled();
    expect(screen.getByLabelText('Groups')).toBeDisabled();
    expect(
      screen.getByRole('button', { name: /create service token/i })
    ).toBeDisabled();
  });

  it('does not render a Cancel button when onCancel is omitted', () => {
    render(<ServiceTokenForm {...defaultProps} />);

    expect(
      screen.queryByRole('button', { name: /cancel/i })
    ).not.toBeInTheDocument();
  });

  it('renders a Cancel button that calls onCancel when provided', async () => {
    const user = userEvent.setup({ delay: 10 });
    const onCancel = vi.fn();
    render(<ServiceTokenForm {...defaultProps} onCancel={onCancel} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    expect(cancelButton).toBeInTheDocument();
    // A type="button" Cancel must not submit the form.
    expect(cancelButton).toHaveAttribute('type', 'button');

    await user.click(cancelButton);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
