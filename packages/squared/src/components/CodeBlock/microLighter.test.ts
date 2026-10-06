import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const elementModule = 'microlighter/micro-lighter-element.js';

// Each test loads a fresh copy of the helper so its once-per-page
// registration cache starts empty.
async function loadHelper() {
  return import('./microLighter');
}

describe('registerMicroLighter', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.doUnmock(elementModule);
    vi.unstubAllGlobals();
  });

  it('skips registration without the Custom Highlight API', async () => {
    const { registerMicroLighter } = await loadHelper();
    await expect(registerMicroLighter()).resolves.toBe(false);
  });

  it('registers the element once per page when highlighting is supported', async () => {
    vi.stubGlobal('CSS', { highlights: new Map() });
    vi.doMock(elementModule, () => ({ MicroLighter: class {} }));
    const { registerMicroLighter } = await loadHelper();

    const first = registerMicroLighter();
    expect(registerMicroLighter()).toBe(first);
    await expect(first).resolves.toBe(true);
  });

  it('falls back to plain text when the element fails to load', async () => {
    vi.stubGlobal('CSS', { highlights: new Map() });
    vi.doMock(elementModule, () => {
      throw new Error('chunk failed to load');
    });
    const { registerMicroLighter } = await loadHelper();

    await expect(registerMicroLighter()).resolves.toBe(false);
  });
});
