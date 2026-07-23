import { beforeEach, describe, expect, test, vi } from 'vitest';

// Mock the route logger so we can assert warn/error are emitted without a real
// pino/Sentry pipeline running. This is the same server-side logger the
// pinoIntegration bridge instruments, so exercising it here is what verifies
// the transport in the server build.
const { warn, error } = vi.hoisted(() => ({
  warn: vi.fn(),
  error: vi.fn(),
}));
vi.mock('@/lib/logger', () => ({
  createRouteLogger: () => ({ warn, error }),
}));

import { POST } from './route';

describe('POST /admin/sentry/emit-log', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('emits a server-side pino warn and error record', async () => {
    const response = await POST();

    expect(warn).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body).toMatchObject({ emitted: ['warn', 'error'] });
  });
});
