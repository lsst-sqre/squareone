import diagnosticsChannel from 'node:diagnostics_channel';
import { EventEmitter } from 'node:events';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  installTunnelResponseListenerLimit,
  isTunnelRequest,
} from './tunnelResponseListeners';

const requestStart = diagnosticsChannel.channel('http.server.request.start');

/**
 * Publish a synthetic `http.server.request.start` message, as Node's HTTP
 * server does before it emits `request`, and return the response so a test
 * can inspect its listener limit.
 */
function publishRequest(url: string) {
  const response = new EventEmitter();
  vi.spyOn(response, 'setMaxListeners');
  requestStart.publish({ request: { url }, response });
  return response;
}

/**
 * Start a real HTTP server, request each path from it, and return the
 * listener limit each response had when the server's request handler ran.
 */
async function serveAndRequest(paths: string[]) {
  const limits: Record<string, number> = {};
  const server = http.createServer((request, response) => {
    limits[request.url ?? ''] = response.getMaxListeners();
    response.end();
  });
  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', resolve);
  });
  try {
    const { port } = server.address() as AddressInfo;
    for (const path of paths) {
      await new Promise<void>((resolve, reject) => {
        http
          .get({ host: '127.0.0.1', port, path }, (response) => {
            response.resume();
            response.on('end', resolve);
          })
          .on('error', reject);
      });
    }
  } finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
  return limits;
}

let uninstall: (() => void) | undefined;

afterEach(() => {
  uninstall?.();
  uninstall = undefined;
});

describe('installTunnelResponseListenerLimit', () => {
  it('raises the listener limit on a tunnel response', () => {
    uninstall = installTunnelResponseListenerLimit({
      tunnelRoute: '/monitoring',
    });

    const response = publishRequest('/monitoring');

    expect(response.setMaxListeners).toHaveBeenCalledWith(20);
    expect(response.getMaxListeners()).toBe(20);
  });

  it('raises the limit on a tunnel request with a query string', () => {
    uninstall = installTunnelResponseListenerLimit({
      tunnelRoute: '/monitoring',
    });

    const response = publishRequest('/monitoring?o=1&p=2');

    expect(response.setMaxListeners).toHaveBeenCalledWith(20);
  });

  it.each(['/', '/monitoring-x', '/api/dev'])(
    'keeps the default limit on %s',
    (url) => {
      uninstall = installTunnelResponseListenerLimit({
        tunnelRoute: '/monitoring',
      });

      const response = publishRequest(url);

      expect(response.setMaxListeners).not.toHaveBeenCalled();
      expect(response.getMaxListeners()).toBe(EventEmitter.defaultMaxListeners);
    }
  );

  it('never lowers a limit that is already higher', () => {
    uninstall = installTunnelResponseListenerLimit({
      tunnelRoute: '/monitoring',
    });
    const response = new EventEmitter().setMaxListeners(50);
    vi.spyOn(response, 'setMaxListeners');

    requestStart.publish({ request: { url: '/monitoring' }, response });

    expect(response.setMaxListeners).not.toHaveBeenCalled();
    expect(response.getMaxListeners()).toBe(50);
  });

  it('subscribes once when installed twice', () => {
    uninstall = installTunnelResponseListenerLimit({
      tunnelRoute: '/monitoring',
    });
    const second = installTunnelResponseListenerLimit({
      tunnelRoute: '/monitoring',
    });
    // A response whose limit never rises, so every subscriber that sees the
    // request calls setMaxListeners.
    const response = { getMaxListeners: () => 10, setMaxListeners: vi.fn() };

    requestStart.publish({ request: { url: '/monitoring' }, response });
    second();

    expect(response.setMaxListeners).toHaveBeenCalledTimes(1);
  });

  it('stops raising the limit once uninstalled', () => {
    installTunnelResponseListenerLimit({ tunnelRoute: '/monitoring' })();

    const response = publishRequest('/monitoring');

    expect(response.setMaxListeners).not.toHaveBeenCalled();
  });

  it('raises the limit before a real server handles the request', async () => {
    uninstall = installTunnelResponseListenerLimit({
      tunnelRoute: '/monitoring',
    });

    const limits = await serveAndRequest(['/monitoring?o=1&p=2', '/']);

    expect(limits).toEqual({
      '/monitoring?o=1&p=2': 20,
      '/': EventEmitter.defaultMaxListeners,
    });
  });
});

describe('isTunnelRequest', () => {
  it('matches the exact tunnel path', () => {
    expect(isTunnelRequest('/monitoring', '/monitoring')).toBe(true);
  });

  it('ignores the query string', () => {
    expect(isTunnelRequest('/monitoring?o=1&p=2', '/monitoring')).toBe(true);
  });

  it('matches the tunnel path followed by a slash', () => {
    expect(isTunnelRequest('/monitoring/?o=1&p=2', '/monitoring')).toBe(true);
  });

  it.each(['/', '/monitoring-x', '/api/dev', '/?next=/monitoring'])(
    'does not match %s',
    (url) => {
      expect(isTunnelRequest(url, '/monitoring')).toBe(false);
    }
  );

  it('does not match a request without a URL', () => {
    expect(isTunnelRequest(undefined, '/monitoring')).toBe(false);
  });
});
