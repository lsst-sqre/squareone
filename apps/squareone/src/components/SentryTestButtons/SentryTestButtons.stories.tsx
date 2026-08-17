import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import SentryTestButtons from './SentryTestButtons';

const meta: Meta<typeof SentryTestButtons> = {
  title: 'Components/SentryTestButtons',
  component: SentryTestButtons,
};

export default meta;
type Story = StoryObj<typeof SentryTestButtons>;

const EMIT_LOG_PATH = '/admin/sentry/emit-log';

/** Marker the stubbed emit-log route echoes back, as the real route does. */
const SMOKE_TEST_MARKER = 'sentry-logs-smoke-test';

/** Resolve the URL of a `fetch` call regardless of which input form was used. */
function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

/**
 * Build a `beforeEach` that answers only the emit-log URL with `body`.
 *
 * The emit-log route handler only exists in the Next.js app, so under Storybook
 * a real POST 404s and a story could only ever reach the failure tone. Stubbing
 * that single URL lets a play function drive the whole round trip, readout
 * included, while every other request (Storybook's own included) still goes to
 * the network. The returned cleanup restores the real `fetch` even when `play()`
 * throws, so a failing assertion can't leak the stub into the next story.
 */
function stubEmitLog(body: unknown, init?: ResponseInit) {
  return () => {
    const originalFetch = window.fetch;
    window.fetch = (async (
      input: RequestInfo | URL,
      requestInit?: RequestInit
    ) => {
      if (!requestUrl(input).endsWith(EMIT_LOG_PATH)) {
        return originalFetch(input, requestInit);
      }
      return Response.json(body, init);
    }) as typeof window.fetch;
    return () => {
      window.fetch = originalFetch;
    };
  };
}

export const Default: Story = {
  beforeEach: stubEmitLog({
    delivery: 'delivered',
    emitted: ['warn', 'error'],
    marker: SMOKE_TEST_MARKER,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // All three test buttons render.
    const throwButton = canvas.getByRole('button', {
      name: /throw uncaught error/i,
    });
    const handledButton = canvas.getByRole('button', {
      name: /capture handled exception/i,
    });
    const emitLogButton = canvas.getByRole('button', {
      name: /emit server log/i,
    });
    await expect(throwButton).toBeInTheDocument();
    await expect(handledButton).toBeInTheDocument();
    await expect(emitLogButton).toBeInTheDocument();

    // The status readout is mounted up front (so the live region is announced
    // reliably) but stays empty and unstyled until there is something to say.
    const status = canvas.getByRole('status');
    await expect(status).toBeInTheDocument();
    await expect(status).toBeEmptyDOMElement();
    await expect(status).toHaveAttribute('data-tone', 'idle');

    // Capturing a handled exception does not break the page: the button is
    // still present afterwards. (The "Throw uncaught error" button is left
    // unclicked here because it intentionally throws during render.)
    await userEvent.click(handledButton);
    await expect(handledButton).toBeInTheDocument();

    // Emitting a server log reports the round trip in the status readout, and
    // echoes the marker an operator searches Sentry Logs for.
    await userEvent.click(emitLogButton);
    await waitFor(() => expect(status).toHaveAttribute('data-tone', 'success'));
    await expect(status).toHaveTextContent(SMOKE_TEST_MARKER);
    await expect(emitLogButton).toBeEnabled();
  },
};

/**
 * The readout when the server has no Sentry DSN: the records were written to
 * the pod's log but never left it, which is a warning rather than a success —
 * and pointing the operator at Sentry Logs would send them looking for a record
 * that does not exist there.
 */
export const SentryDisabled: Story = {
  beforeEach: stubEmitLog(
    {
      delivery: 'sentry-disabled',
      emitted: ['warn', 'error'],
      marker: SMOKE_TEST_MARKER,
    },
    { status: 503 }
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const status = canvas.getByRole('status');

    await userEvent.click(
      canvas.getByRole('button', { name: /emit server log/i })
    );

    await waitFor(() => expect(status).toHaveAttribute('data-tone', 'warning'));
    await expect(status).toHaveTextContent(/sentry is disabled/i);
    await expect(status).not.toHaveTextContent(SMOKE_TEST_MARKER);
  },
};
