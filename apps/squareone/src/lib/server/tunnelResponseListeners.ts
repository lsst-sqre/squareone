/**
 * Workaround for a Next.js 16.3 regression that logs a
 * `MaxListenersExceededWarning` on every Sentry tunnel request
 * (vercel/next.js#97757).
 *
 * Next 16.3 proxies requests rewritten to an external origin through a new
 * httpxy-based proxy. On such a request the proxy and Next's router register 9
 * `close` listeners on the `ServerResponse`, and the Sentry server SDK
 * registers 2 more. The 11th crosses Node's default limit of 10, so Node warns.
 * Squareone's only production rewrite to an external origin is Sentry's
 * `tunnelRoute` (see sentry.tunnel.config.js), which the browser SDK posts to
 * on every page load, so the warning fires on every page view. The listeners
 * are all released when the response closes: this is noise, not a leak.
 *
 * The workaround raises the limit on tunnel responses only. Every other
 * response keeps Node's default of 10, so the warning stays a real signal
 * elsewhere (an ordinary page render stays below 10 `close` listeners).
 *
 * Remove this module, and its call in instrumentation.ts, once Squareone runs a
 * Next.js release that contains the upstream fix, vercel/next.js#97818.
 */

import diagnosticsChannel from 'node:diagnostics_channel';
import type { IncomingMessage, ServerResponse } from 'node:http';

/**
 * Node publishes on this built-in channel when its HTTP server receives a
 * request, before it emits `request`, so the subscriber runs before Next's
 * request handler adds any listeners. Sentry's `httpIntegration` subscribes
 * to the same channel.
 */
const REQUEST_START_CHANNEL = 'http.server.request.start';

type RequestStartMessage = {
  request: IncomingMessage;
  response: ServerResponse;
};

export type TunnelResponseListenerLimitOptions = {
  /** The tunnel path, such as `/monitoring`. */
  tunnelRoute: string;
  /** The listener limit for tunnel responses (Node's default is 10). */
  maxListeners?: number;
};

let uninstallCurrent: (() => void) | undefined;

/**
 * Raise the `ServerResponse` max-listener limit on requests to the Sentry
 * tunnel route, for the life of the process. A response whose limit is
 * already at least `maxListeners` is left alone.
 *
 * Installing is idempotent: while an installation is active, a further call
 * subscribes nothing and returns the active installation's uninstall
 * function. Uninstalling (used by tests) unsubscribes from the channel.
 *
 * @returns A function that removes the subscription.
 */
export function installTunnelResponseListenerLimit({
  tunnelRoute,
  maxListeners = 20,
}: TunnelResponseListenerLimitOptions): () => void {
  if (uninstallCurrent) return uninstallCurrent;

  const onRequestStart = (message: unknown) => {
    const { request, response } = message as RequestStartMessage;
    if (!isTunnelRequest(request.url, tunnelRoute)) return;
    if (response.getMaxListeners() < maxListeners) {
      response.setMaxListeners(maxListeners);
    }
  };
  diagnosticsChannel.subscribe(REQUEST_START_CHANNEL, onRequestStart);

  const uninstall = () => {
    diagnosticsChannel.unsubscribe(REQUEST_START_CHANNEL, onRequestStart);
    if (uninstallCurrent === uninstall) uninstallCurrent = undefined;
  };
  uninstallCurrent = uninstall;
  return uninstall;
}

/**
 * Whether a request URL (the origin-form `request.url`, such as
 * `/monitoring?o=1&p=2`) targets the tunnel route: its path is the tunnel
 * route itself or a path beneath it. The query string is ignored.
 */
export function isTunnelRequest(
  url: string | undefined,
  tunnelRoute: string
): boolean {
  if (!url) return false;
  const queryStart = url.indexOf('?');
  const pathname = queryStart === -1 ? url : url.slice(0, queryStart);
  return pathname === tunnelRoute || pathname.startsWith(`${tunnelRoute}/`);
}
