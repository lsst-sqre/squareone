import { act, render, screen } from '@testing-library/react';
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

  test('"Emit server log" POSTs to the emit-log route so the server logs a warn/error', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(null, { status: 200 }));

    render(<SentryTestButtons />);

    await userEvent.click(
      screen.getByRole('button', { name: /emit server log/i })
    );

    // The X-Requested-With header makes Gafaelfawr answer an expired session
    // with a direct 403 instead of a cross-origin 302 toward CILogon, which
    // the default `redirect: 'follow'` fetch would chase into a CORS failure.
    expect(fetchMock).toHaveBeenCalledWith('/admin/sentry/emit-log', {
      method: 'POST',
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
    });

    fetchMock.mockRestore();
  });

  test('"Emit server log" blocks a second POST while the first is in flight', async () => {
    let resolveFetch: (response: Response) => void = () => {};
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(
      () =>
        new Promise<Response>((resolve) => {
          resolveFetch = resolve;
        })
    );

    render(<SentryTestButtons />);

    const button = screen.getByRole('button', { name: /emit server log/i });
    await userEvent.click(button);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');

    // A rapid second click must not fire a concurrent POST whose response
    // could race the first one's status update.
    await userEvent.click(button);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveFetch(new Response(null, { status: 200 }));
    });

    // Once the request settles the button is clickable again.
    expect(button).toBeEnabled();
    expect(
      screen.getByText('Emitted server log (HTTP 200)')
    ).toBeInTheDocument();

    fetchMock.mockRestore();
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
