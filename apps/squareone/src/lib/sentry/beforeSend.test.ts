import type { ErrorEvent } from '@sentry/nextjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { beforeSend } from './beforeSend';

const hydrationEvent = (): ErrorEvent => ({
  type: undefined,
  exception: {
    values: [
      {
        type: 'Error',
        value:
          "Hydration failed because the server rendered HTML didn't match the client.",
      },
    ],
  },
});

const nonHydrationEvent = (): ErrorEvent => ({
  type: undefined,
  exception: {
    values: [{ type: 'TypeError', value: 'x is not a function' }],
  },
});

afterEach(() => {
  vi.unstubAllGlobals();
  // Remove any extension-style attributes a test stamped onto the live DOM.
  for (const el of [document.body, document.documentElement]) {
    for (const name of el.getAttributeNames()) {
      if (name.startsWith('data-') || name === 'cz-shortcut-listen') {
        el.removeAttribute(name);
      }
    }
  }
});

describe('beforeSend', () => {
  it('tags and regroups extension hydration noise without dropping it', () => {
    document.body.setAttribute('data-gr-ext-installed', 'true');
    const event = hydrationEvent();

    const result = beforeSend(event);

    // The event is kept, not dropped.
    expect(result).toBe(event);
    expect(result?.tags?.['hydration.classification']).toBe('extension');
    expect(result?.fingerprint).toEqual(['hydration-extension-noise']);

    const context = result?.contexts?.hydration;
    expect(context?.classification).toBe('extension');
    expect(context?.markers).toContain('grammarly');
    expect(typeof context?.bodyAttributeFingerprint).toBe('string');
  });

  it('tags a clean hydration error as in-app and leaves grouping unchanged', () => {
    const event = hydrationEvent();

    const result = beforeSend(event);

    expect(result?.tags?.['hydration.classification']).toBe('in-app');
    expect(result?.fingerprint).toBeUndefined();
    expect(result?.contexts?.hydration?.classification).toBe('in-app');
  });

  it('tags non-hydration errors as unknown and leaves grouping unchanged', () => {
    const event = nonHydrationEvent();

    const result = beforeSend(event);

    expect(result?.tags?.['hydration.classification']).toBe('unknown');
    expect(result?.fingerprint).toBeUndefined();
  });

  it('returns the event unchanged when document is unavailable', () => {
    vi.stubGlobal('document', undefined);
    const event = hydrationEvent();

    const result = beforeSend(event);

    expect(result).toBe(event);
    expect(result?.tags).toBeUndefined();
  });

  it('never throws and returns the event when internal logic errors', () => {
    // A document whose body access throws exercises the defensive try/catch.
    vi.stubGlobal('document', {
      get body() {
        throw new Error('boom');
      },
      get documentElement() {
        throw new Error('boom');
      },
    });
    const event = hydrationEvent();

    let result: ErrorEvent | null = null;
    expect(() => {
      result = beforeSend(event);
    }).not.toThrow();
    expect(result).toBe(event);
  });
});
