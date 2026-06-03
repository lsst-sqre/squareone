import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

// Mock the Sentry SDK so the handled-exception path can be asserted without a
// real Sentry client being initialized.
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
}));

// Import after mocking.
import * as Sentry from '@sentry/nextjs';
import SentryTestButtons from './SentryTestButtons';

// Minimal error boundary so the render-time throw can be observed in a test
// the way the App Router's app/error.tsx boundary observes it at runtime.
class TestErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return <div role="alert">Caught: {this.state.error.message}</div>;
    }
    return this.props.children;
  }
}

describe('SentryTestButtons', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('"Capture handled exception" sends a handled event to Sentry without breaking the page', async () => {
    render(<SentryTestButtons />);

    await userEvent.click(
      screen.getByRole('button', { name: /capture handled exception/i })
    );

    expect(Sentry.captureException).toHaveBeenCalledTimes(1);
    expect(Sentry.captureException).toHaveBeenCalledWith(expect.any(Error));

    // The page is not broken: the button is still rendered after the click.
    expect(
      screen.getByRole('button', { name: /capture handled exception/i })
    ).toBeInTheDocument();
  });

  test('"Throw uncaught error" throws "Sentry Test Error" for the error boundary to catch', async () => {
    // React logs the boundary-caught error to console.error; silence it so the
    // expected throw doesn't produce noisy output.
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    render(
      <TestErrorBoundary>
        <SentryTestButtons />
      </TestErrorBoundary>
    );

    await userEvent.click(
      screen.getByRole('button', { name: /throw uncaught error/i })
    );

    // The error boundary caught the thrown error rather than the click handler
    // swallowing it.
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Caught: Sentry Test Error'
    );

    consoleError.mockRestore();
  });
});
