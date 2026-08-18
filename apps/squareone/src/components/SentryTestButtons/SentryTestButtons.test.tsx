import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import {
  EMIT_LOG_PATH,
  SMOKE_TEST_MARKER,
} from '@/lib/sentry/emitLogSmokeTest';

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
// through. That arrangement is guarded by `src/tests/restoreMocks.test.ts`.
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

  test('the status readout carries no tone until there is something to report', () => {
    render(<SentryTestButtons />);

    // Every tone in the union is a real outcome of a real attempt, so an
    // empty readout has none — it omits the attribute rather than carrying a
    // synthetic "idle" value that the type, the CSS and this test would each
    // have to keep agreeing about.
    expect(screen.getByRole('status')).not.toHaveAttribute('data-tone');
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
    expect(fetchMock).toHaveBeenCalledWith(EMIT_LOG_PATH, {
      method: 'POST',
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
    });
  });

  test('"Emit server log" surfaces the smoke-test marker from the response body', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      Response.json({
        delivery: 'delivered',
        emitted: ['warn', 'error'],
        marker: SMOKE_TEST_MARKER,
      })
    );

    render(<SentryTestButtons />);

    await userEvent.click(
      screen.getByRole('button', { name: /emit server log/i })
    );

    // The records deliberately never become issues, so the marker is the only
    // handle an operator has for finding them in Sentry Logs.
    expect(screen.getByRole('status')).toHaveTextContent(SMOKE_TEST_MARKER);
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

  test('"Emit server log" announces the in-flight attempt through exactly one live region', async () => {
    let resolveFetch: (response: Response) => void = () => {};
    vi.spyOn(globalThis, 'fetch').mockImplementation(
      () =>
        new Promise<Response>((resolve) => {
          resolveFetch = resolve;
        })
    );

    render(<SentryTestButtons />);

    const button = screen.getByRole('button', { name: /emit server log/i });
    await userEvent.click(button);

    // The loading button must not contribute a live region of its own: two
    // polite regions talking over each other give one action two competing
    // announcements, and every `getByRole('status')` in this file would throw
    // "Found multiple elements" for the pending state.
    expect(screen.getAllByRole('status')).toHaveLength(1);
    expect(screen.getByRole('status')).toHaveTextContent('Emitting…');

    // The button reports being busy through aria-busy instead, which is a
    // property of the control rather than a second announcement.
    expect(button).toHaveAttribute('aria-busy', 'true');

    await act(async () => {
      resolveFetch(new Response(null, { status: 200 }));
    });
  });

  test('"Emit server log" reports a flush timeout as a failure, without the marker hint', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      Response.json(
        {
          delivery: 'flush-timeout',
          emitted: ['warn', 'error'],
          marker: SMOKE_TEST_MARKER,
        },
        { status: 503 }
      )
    );

    render(<SentryTestButtons />);

    await userEvent.click(
      screen.getByRole('button', { name: /emit server log/i })
    );

    // Sending the operator to Sentry Logs for a record that may never have
    // arrived is the failure mode this readout exists to prevent.
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('data-tone', 'failure');
    expect(status).toHaveTextContent(/flush timed out/i);
    expect(status).not.toHaveTextContent(/search sentry logs/i);
  });

  test('"Emit server log" warns when Sentry is disabled instead of pointing at Sentry Logs', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      Response.json(
        {
          delivery: 'sentry-disabled',
          emitted: ['warn', 'error'],
          marker: SMOKE_TEST_MARKER,
        },
        { status: 503 }
      )
    );

    render(<SentryTestButtons />);

    await userEvent.click(
      screen.getByRole('button', { name: /emit server log/i })
    );

    // Without a DSN the records exist only in the pod's log, so there is
    // nothing to search for and nothing broken either.
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('data-tone', 'warning');
    expect(status).toHaveTextContent(/sentry is disabled/i);
    expect(status).not.toHaveTextContent(/search sentry logs/i);
  });

  test('"Emit server log" warns when the server log level gated every level', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      Response.json({
        delivery: 'delivered',
        emitted: [],
        marker: SMOKE_TEST_MARKER,
      })
    );

    render(<SentryTestButtons />);

    await userEvent.click(
      screen.getByRole('button', { name: /emit server log/i })
    );

    // A flush with an empty buffer succeeds, so `delivery` alone would report
    // this as a clean pass of a test that emitted nothing at all.
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('data-tone', 'warning');
    expect(status).toHaveTextContent(/emitted nothing/i);
    expect(status).not.toHaveTextContent(/search sentry logs/i);
  });

  test('"Emit server log" warns about a partial emit but still offers the marker', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      Response.json({
        delivery: 'delivered',
        emitted: ['error'],
        marker: SMOKE_TEST_MARKER,
      })
    );

    render(<SentryTestButtons />);

    await userEvent.click(
      screen.getByRole('button', { name: /emit server log/i })
    );

    // The error record did reach Sentry, so the search hint stays useful even
    // though warn never made it out of pino.
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('data-tone', 'warning');
    expect(status).toHaveTextContent(/gated warn/i);
    expect(status).toHaveTextContent(/search sentry logs/i);
  });

  test('"Emit server log" marks a successful emit with the success tone', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      Response.json({ delivery: 'delivered', emitted: ['warn', 'error'] })
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
});
