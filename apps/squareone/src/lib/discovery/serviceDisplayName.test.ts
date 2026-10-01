import { describe, expect, test } from 'vitest';

import { serviceDisplayName } from './serviceDisplayName';

describe('serviceDisplayName', () => {
  test('uses a non-empty discovery title', () => {
    expect(serviceDisplayName('Table access protocol (TAP)', 'tap')).toBe(
      'Table access protocol (TAP)'
    );
  });

  test('falls back to the service name for an empty title', () => {
    expect(serviceDisplayName('', 'tap')).toBe('tap');
  });

  test('falls back to the service name for a whitespace-only title', () => {
    expect(serviceDisplayName(' \t\n ', 'tap')).toBe('tap');
  });

  test('falls back to the service name for a null title', () => {
    expect(serviceDisplayName(null, 'tap')).toBe('tap');
  });

  test('falls back to the service name for an undefined title', () => {
    expect(serviceDisplayName(undefined, 'tap')).toBe('tap');
  });
});
