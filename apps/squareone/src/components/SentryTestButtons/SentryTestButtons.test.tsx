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

// The spies installed below are never restored inline: the unit vitest project
// sets `restoreMocks: true` (see vitest.config.ts), which tears every spy down
// before the next test even when the test that installed it fails partway
// through. The last two tests in this file guard that arrangement.
describe('SentryTestButtons', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('mounts the status live region before it holds a message', () => {
    render(<SentryTestButtons />);

    // A live region that enters the DOM already containing its first message
    // is announced unreliably, so the region is mounted (and empty) up front.
    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
    expect(status).toBeEmptyDOMElement();
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
  });

  test('"Emit server log" surfaces the smoke-test marker from the response body', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      Response.json({
        emitted: ['warn', 'error'],
        marker: 'sentry-logs-smoke-test',
      })
    );

    render(<SentryTestButtons />);

    await userEvent.click(
      screen.getByRole('button', { name: /emit server log/i })
    );

    // The records deliberately never become issues, so the marker is the only
    // handle an operator has for finding them in Sentry Logs.
    expect(screen.getByRole('status')).toHaveTextContent(
      'sentry-logs-smoke-test'
    );
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
  });

  test('"Emit server log" marks a successful emit with the success tone', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      Response.json({ emitted: ['warn', 'error'] })
    );

    render(<SentryTestButtons />);

    await userEvent.click(
      screen.getByRole('button', { name: /emit server log/i })
    );

    // The tone drives the readout's styling, so success and failure are not
    // visually identical.
    expect(screen.getByRole('status')).toHaveAttribute('data-tone', 'success');
  });

  test('"Emit server log" marks a failed emit with the failure tone', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(null, { status: 500 })
    );

    render(<SentryTestButtons />);

    await userEvent.click(
      screen.getByRole('button', { name: /emit server log/i })
    );

    expect(screen.getByRole('status')).toHaveAttribute('data-tone', 'failure');
  });

  test('"Throw uncaught error" throws "Sentry Test Error" for the error boundary to catch', async () => {
    // React logs the boundary-caught error to console.error; silence it so the
    // expected throw doesn't produce noisy output.
    vi.spyOn(console, 'error').mockImplementation(() => {});

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
  });

  // These two tests are a pair, and only mean anything in order. They pin the
  // `restoreMocks` setting every test above relies on for teardown: an inline
  // `mockRestore()` at the end of a test is skipped whenever an earlier
  // assertion in that test fails, which would leave `globalThis.fetch` stubbed
  // for every test that follows and turn one real failure into a cascade of
  // misleading ones. `test.fails` lets the first test model such a failure
  // without failing the suite, so the second can assert the stub was torn down
  // regardless.
  test.fails('a failing test may leave its fetch stub un-restored', () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(null, { status: 200 })
    );

    expect(vi.isMockFunction(globalThis.fetch)).toBe(false);
  });

  test('a failed test does not leak its fetch stub into later tests', () => {
    expect(vi.isMockFunction(globalThis.fetch)).toBe(false);
  });
});
