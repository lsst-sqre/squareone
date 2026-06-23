import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import NotificationForm from './NotificationForm';

function renderForm(
  props: Partial<React.ComponentProps<typeof NotificationForm>> = {}
) {
  const onSubmit = props.onSubmit ?? vi.fn().mockResolvedValue(undefined);
  render(<NotificationForm onSubmit={onSubmit} {...props} />);
  return { onSubmit };
}

describe('NotificationForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders the recipient, summary, body fields and a send button', () => {
    renderForm();

    expect(screen.getByLabelText(/recipient/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/summary/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^body/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /send notification/i })
    ).toBeInTheDocument();
  });

  test('explains that summary is inline Markdown while body is full Markdown', () => {
    renderForm();

    expect(screen.getByText(/inline markdown/i)).toBeInTheDocument();
    expect(screen.getByText(/full markdown/i)).toBeInTheDocument();
  });

  test('shows inline errors for empty required fields without losing input', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    // Provide a recipient but leave the required summary empty.
    await user.type(screen.getByLabelText(/recipient/i), 'rachel');
    await user.click(
      screen.getByRole('button', { name: /send notification/i })
    );

    expect(await screen.findByText(/summary is required/i)).toBeInTheDocument();
    // The valid input the operator already typed is preserved.
    expect(screen.getByLabelText(/recipient/i)).toHaveValue('rachel');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('requires a recipient', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await user.type(screen.getByLabelText(/summary/i), 'Heads up');
    await user.click(
      screen.getByRole('button', { name: /send notification/i })
    );

    expect(
      await screen.findByText(/recipient is required/i)
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('renders a live preview of the summary Markdown', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(/summary/i), 'a **bold** word');

    // The inline `**bold**` renders to a <strong> element in the preview.
    const strong = await screen.findByText('bold');
    expect(strong.tagName).toBe('STRONG');
  });

  test('renders a live preview of the body Markdown', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(/^body/i), '# Outage');

    expect(
      await screen.findByRole('heading', { name: 'Outage' })
    ).toBeInTheDocument();
  });

  test('submits the recipient, summary, body, and draft-another flag', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await user.type(screen.getByLabelText(/recipient/i), 'rachel');
    await user.type(screen.getByLabelText(/summary/i), 'Heads up');
    await user.type(screen.getByLabelText(/^body/i), 'Full **details**.');
    await user.click(
      screen.getByRole('button', { name: /send notification/i })
    );

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        recipient: 'rachel',
        summary: 'Heads up',
        body: 'Full **details**.',
        draftAnother: false,
      });
    });
  });

  test('omits the body when it is left blank', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await user.type(screen.getByLabelText(/recipient/i), 'rachel');
    await user.type(screen.getByLabelText(/summary/i), 'Heads up');
    await user.click(
      screen.getByRole('button', { name: /send notification/i })
    );

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        recipient: 'rachel',
        summary: 'Heads up',
        body: undefined,
        draftAnother: false,
      });
    });
  });

  test('trims surrounding whitespace from the submitted summary and body', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await user.type(screen.getByLabelText(/recipient/i), '  rachel  ');
    await user.type(screen.getByLabelText(/summary/i), '  Heads up  ');
    await user.type(screen.getByLabelText(/^body/i), '  Full **details**.  ');
    await user.click(
      screen.getByRole('button', { name: /send notification/i })
    );

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        recipient: 'rachel',
        summary: 'Heads up',
        body: 'Full **details**.',
        draftAnother: false,
      });
    });
  });

  test('omits the body when it contains only whitespace', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await user.type(screen.getByLabelText(/recipient/i), 'rachel');
    await user.type(screen.getByLabelText(/summary/i), 'Heads up');
    await user.type(screen.getByLabelText(/^body/i), '   ');
    await user.click(
      screen.getByRole('button', { name: /send notification/i })
    );

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        recipient: 'rachel',
        summary: 'Heads up',
        body: undefined,
        draftAnother: false,
      });
    });
  });

  test('clears the form and confirms success when "draft another" is checked', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await user.type(screen.getByLabelText(/recipient/i), 'rachel');
    await user.type(screen.getByLabelText(/summary/i), 'Heads up');
    await user.click(screen.getByRole('checkbox', { name: /draft another/i }));
    await user.click(
      screen.getByRole('button', { name: /send notification/i })
    );

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        recipient: 'rachel',
        summary: 'Heads up',
        body: undefined,
        draftAnother: true,
      });
    });

    expect(await screen.findByText(/notification sent/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/recipient/i)).toHaveValue('');
    expect(screen.getByLabelText(/summary/i)).toHaveValue('');
    // The checkbox stays checked so the operator can keep drafting.
    expect(
      screen.getByRole('checkbox', { name: /draft another/i })
    ).toBeChecked();
  });

  test('keeps the form populated when "draft another" is unchecked', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await user.type(screen.getByLabelText(/recipient/i), 'rachel');
    await user.type(screen.getByLabelText(/summary/i), 'Heads up');
    await user.click(
      screen.getByRole('button', { name: /send notification/i })
    );

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });

    // No success banner: the page handles navigation away on the unchecked path.
    expect(screen.queryByText(/notification sent/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/recipient/i)).toHaveValue('rachel');
  });

  test('shows a clear error when the submit fails', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockRejectedValue(new Error('Semaphore is down'));
    renderForm({ onSubmit });

    await user.type(screen.getByLabelText(/recipient/i), 'rachel');
    await user.type(screen.getByLabelText(/summary/i), 'Heads up');
    await user.click(
      screen.getByRole('button', { name: /send notification/i })
    );

    expect(await screen.findByText(/semaphore is down/i)).toBeInTheDocument();
  });

  test('prefills fields from initialValues', () => {
    renderForm({
      initialValues: {
        recipient: 'rachel',
        summary: 'Prefilled summary',
        body: 'Prefilled body',
      },
    });

    expect(screen.getByLabelText(/recipient/i)).toHaveValue('rachel');
    expect(screen.getByLabelText(/summary/i)).toHaveValue('Prefilled summary');
    expect(screen.getByLabelText(/^body/i)).toHaveValue('Prefilled body');
  });

  test('disables every field and the send button when disabled', () => {
    renderForm({ disabled: true });

    expect(screen.getByLabelText(/recipient/i)).toBeDisabled();
    expect(screen.getByLabelText(/summary/i)).toBeDisabled();
    expect(screen.getByLabelText(/^body/i)).toBeDisabled();
    expect(
      screen.getByRole('button', { name: /send notification/i })
    ).toBeDisabled();
  });

  test('calls onCancel when the cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    renderForm({ onCancel });

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
