import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

import OIDCClientForm from './OIDCClientForm';

/** Fill both required fields with values that pass client-side validation. */
async function fillValidForm(
  user: ReturnType<typeof userEvent.setup>,
  overrides: { returnUri?: string; description?: string } = {}
) {
  await user.type(
    screen.getByLabelText(/return uri/i),
    overrides.returnUri ?? 'https://app.example.org/oauth/callback'
  );
  await user.type(
    screen.getByLabelText(/description/i),
    overrides.description ?? 'Example relying party'
  );
}

describe('OIDCClientForm', () => {
  test('renders the create-mode fields and submit button', () => {
    render(<OIDCClientForm mode="create" onSubmit={vi.fn()} />);

    expect(screen.getByLabelText(/return uri/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /create client/i })
    ).toBeInTheDocument();
  });

  test('submits the trimmed required fields', async () => {
    const user = userEvent.setup({ delay: 10 });
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<OIDCClientForm onSubmit={onSubmit} />);

    await fillValidForm(user, {
      returnUri: '  https://app.example.org/oauth/callback  ',
      description: '  Example relying party  ',
    });
    await user.click(screen.getByRole('button', { name: /create client/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        return_uri: 'https://app.example.org/oauth/callback',
        description: 'Example relying party',
        notes: undefined,
      });
    });
  });

  test('submits notes when the operator supplies them', async () => {
    const user = userEvent.setup({ delay: 10 });
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<OIDCClientForm onSubmit={onSubmit} />);

    await fillValidForm(user);
    await user.type(screen.getByLabelText(/notes/i), 'Owned by SQuaRE');
    await user.click(screen.getByRole('button', { name: /create client/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ notes: 'Owned by SQuaRE' })
      );
    });
  });

  test('blocks submission when the return URI is missing', async () => {
    const user = userEvent.setup({ delay: 10 });
    const onSubmit = vi.fn();
    render(<OIDCClientForm onSubmit={onSubmit} />);

    await user.type(
      screen.getByLabelText(/description/i),
      'Example relying party'
    );
    await user.click(screen.getByRole('button', { name: /create client/i }));

    expect(await screen.findByText(/return uri is required/i)).toBeVisible();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('blocks submission when the return URI is not an absolute URL', async () => {
    const user = userEvent.setup({ delay: 10 });
    const onSubmit = vi.fn();
    render(<OIDCClientForm onSubmit={onSubmit} />);

    // A bare path is meaningless as a redirect target outside the browser that
    // typed it, so it must not reach Gafaelfawr.
    await fillValidForm(user, { returnUri: '/oauth/callback' });
    await user.click(screen.getByRole('button', { name: /create client/i }));

    expect(
      await screen.findByText(/return uri must be an absolute url, including/i)
    ).toBeVisible();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('blocks submission when the description is missing', async () => {
    const user = userEvent.setup({ delay: 10 });
    const onSubmit = vi.fn();
    render(<OIDCClientForm onSubmit={onSubmit} />);

    await user.type(
      screen.getByLabelText(/return uri/i),
      'https://app.example.org/oauth/callback'
    );
    await user.click(screen.getByRole('button', { name: /create client/i }));

    expect(await screen.findByText(/description is required/i)).toBeVisible();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('renders a failed submit inline without clearing the input', async () => {
    const user = userEvent.setup({ delay: 10 });
    const onSubmit = vi
      .fn()
      .mockRejectedValue(new Error('return_uri: value is not a valid URL'));
    render(<OIDCClientForm onSubmit={onSubmit} />);

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /create client/i }));

    // The server's own message is what the operator needs to act on.
    expect(
      await screen.findByText(/value is not a valid url/i)
    ).toBeInTheDocument();
    // Correcting a 422 is only possible if the input survives it.
    expect(screen.getByLabelText(/return uri/i)).toHaveValue(
      'https://app.example.org/oauth/callback'
    );
    expect(screen.getByLabelText(/description/i)).toHaveValue(
      'Example relying party'
    );
  });

  test('clears a previous error when the form is resubmitted', async () => {
    const user = userEvent.setup({ delay: 10 });
    const onSubmit = vi
      .fn()
      .mockRejectedValueOnce(new Error('Gafaelfawr is unavailable'))
      .mockResolvedValueOnce(undefined);
    render(<OIDCClientForm onSubmit={onSubmit} />);

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /create client/i }));
    expect(
      await screen.findByText(/gafaelfawr is unavailable/i)
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /create client/i }));

    await waitFor(() => {
      expect(
        screen.queryByText(/gafaelfawr is unavailable/i)
      ).not.toBeInTheDocument();
    });
  });

  test('seeds the fields from defaultValues in edit mode', () => {
    render(
      <OIDCClientForm
        mode="edit"
        defaultValues={{
          return_uri: 'https://chronograf.example.org/oauth/callback',
          description: 'Chronograf dashboards',
          notes: 'Owned by the SQuaRE team.',
        }}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByLabelText(/return uri/i)).toHaveValue(
      'https://chronograf.example.org/oauth/callback'
    );
    expect(screen.getByLabelText(/description/i)).toHaveValue(
      'Chronograf dashboards'
    );
    expect(screen.getByLabelText(/notes/i)).toHaveValue(
      'Owned by the SQuaRE team.'
    );
    expect(
      screen.getByRole('button', { name: /save changes/i })
    ).toBeInTheDocument();
  });

  test('disables every field and the submit button when disabled', () => {
    render(<OIDCClientForm onSubmit={vi.fn()} disabled />);

    expect(screen.getByLabelText(/return uri/i)).toBeDisabled();
    expect(screen.getByLabelText(/description/i)).toBeDisabled();
    expect(screen.getByLabelText(/notes/i)).toBeDisabled();
    expect(
      screen.getByRole('button', { name: /create client/i })
    ).toBeDisabled();
  });

  test('calls onCancel when Cancel is clicked', async () => {
    const user = userEvent.setup({ delay: 10 });
    const onCancel = vi.fn();
    render(<OIDCClientForm onSubmit={vi.fn()} onCancel={onCancel} />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onCancel).toHaveBeenCalled();
  });

  test('renders no Cancel button when onCancel is omitted', () => {
    render(<OIDCClientForm onSubmit={vi.fn()} />);

    expect(
      screen.queryByRole('button', { name: /cancel/i })
    ).not.toBeInTheDocument();
  });
});
