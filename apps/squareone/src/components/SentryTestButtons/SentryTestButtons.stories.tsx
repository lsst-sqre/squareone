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

export const Default: Story = {
  // The emit-log route handler only exists in the Next.js app, so under
  // Storybook a real POST 404s and the story could only ever reach the failure
  // tone. Answering just that one URL with the route's success shape lets the
  // play function drive the whole round trip, marker readout included, while
  // every other request (Storybook's own included) still goes to the network.
  // The returned cleanup restores the real `fetch` even when `play()` throws,
  // so a failing assertion can't leak the stub into the next story.
  beforeEach: () => {
    const originalFetch = window.fetch;
    window.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      if (!requestUrl(input).endsWith(EMIT_LOG_PATH)) {
        return originalFetch(input, init);
      }
      return Response.json({
        emitted: ['warn', 'error'],
        marker: SMOKE_TEST_MARKER,
      });
    }) as typeof window.fetch;
    return () => {
      window.fetch = originalFetch;
    };
  },
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
