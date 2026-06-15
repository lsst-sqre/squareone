import type { Event } from '@sentry/nextjs';
import { describe, expect, it } from 'vitest';
import {
  classifyHydrationEvent,
  isHydrationError,
  KNOWN_EXTENSION_MARKERS,
} from './hydrationClassifier';

// A Grammarly body attribute is the canonical extension marker used across
// these tests.
const GRAMMARLY_ATTR = 'data-gr-ext-installed';

const hydrationEventFromMessage = (value: string): Event => ({
  exception: { values: [{ type: 'Error', value }] },
});

describe('isHydrationError', () => {
  it('detects the React "Hydration failed" message', () => {
    const event = hydrationEventFromMessage(
      "Hydration failed because the server rendered HTML didn't match the client."
    );
    expect(isHydrationError(event)).toBe(true);
  });

  it('detects minified React hydration error codes (418-425)', () => {
    for (const code of [418, 419, 421, 422, 423, 425]) {
      const event = hydrationEventFromMessage(
        `Minified React error #${code}; visit https://react.dev/errors/${code} for the full message.`
      );
      expect(isHydrationError(event)).toBe(true);
    }
  });

  it('reads the top-level event message as well as exception values', () => {
    const event: Event = {
      message: 'Text content does not match server-rendered HTML.',
    };
    expect(isHydrationError(event)).toBe(true);
  });

  it('does not flag unrelated errors', () => {
    const event = hydrationEventFromMessage('TypeError: x is not a function');
    expect(isHydrationError(event)).toBe(false);
  });

  it('does not flag an unrelated React error code', () => {
    const event = hydrationEventFromMessage(
      'Minified React error #310; visit https://react.dev/errors/310'
    );
    expect(isHydrationError(event)).toBe(false);
  });

  it('does not flag a generic "didn\'t match" error without a hydration stem', () => {
    const event = hydrationEventFromMessage(
      "Received value didn't match the expected snapshot"
    );
    expect(isHydrationError(event)).toBe(false);
  });

  it('flags a "didn\'t match" message when a hydration stem co-occurs', () => {
    const event = hydrationEventFromMessage(
      "While hydrating, the server rendered HTML didn't match the client."
    );
    expect(isHydrationError(event)).toBe(true);
  });

  it('is defensive against an empty event', () => {
    expect(isHydrationError({})).toBe(false);
  });
});

describe('KNOWN_EXTENSION_MARKERS', () => {
  it('includes Grammarly and Dark Reader signatures', () => {
    const ids = KNOWN_EXTENSION_MARKERS.map((marker) => marker.id);
    expect(ids).toContain('grammarly');
    expect(ids).toContain('darkreader');
  });
});

describe('classifyHydrationEvent', () => {
  it('classifies a hydration error with a known marker as extension', () => {
    const result = classifyHydrationEvent({
      event: hydrationEventFromMessage('Hydration failed'),
      bodyAttrs: [GRAMMARLY_ATTR],
      htmlAttrs: [],
    });
    expect(result.classification).toBe('extension');
    expect(result.markers).toContain('grammarly');
  });

  it('matches markers on the documentElement snapshot too', () => {
    const result = classifyHydrationEvent({
      event: hydrationEventFromMessage('Hydration failed'),
      bodyAttrs: [],
      htmlAttrs: ['data-darkreader-mode'],
    });
    expect(result.classification).toBe('extension');
    expect(result.markers).toContain('darkreader');
  });

  it('classifies a hydration error with a clean DOM as in-app', () => {
    const result = classifyHydrationEvent({
      event: hydrationEventFromMessage('Hydration failed'),
      bodyAttrs: ['class'],
      htmlAttrs: ['lang', 'data-theme'],
    });
    expect(result.classification).toBe('in-app');
    expect(result.markers).toEqual([]);
  });

  it('classifies a non-hydration error as unknown even with markers present', () => {
    const result = classifyHydrationEvent({
      event: hydrationEventFromMessage('TypeError: boom'),
      bodyAttrs: [GRAMMARLY_ATTR],
      htmlAttrs: [],
    });
    expect(result.classification).toBe('unknown');
  });

  it('does not bury a generic "didn\'t match" app error under extension noise', () => {
    const result = classifyHydrationEvent({
      event: hydrationEventFromMessage(
        "Received value didn't match the expected snapshot"
      ),
      bodyAttrs: [GRAMMARLY_ATTR],
      htmlAttrs: [],
    });
    expect(result.classification).toBe('unknown');
  });

  it('is defensive when the DOM snapshot is missing or empty', () => {
    const result = classifyHydrationEvent({
      event: hydrationEventFromMessage('Hydration failed'),
      bodyAttrs: undefined,
      htmlAttrs: undefined,
    });
    expect(result.classification).toBe('in-app');
    expect(result.markers).toEqual([]);
  });
});
