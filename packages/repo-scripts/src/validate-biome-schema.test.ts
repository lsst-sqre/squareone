import { describe, expect, it } from 'vitest';

import {
  extractSchemaVersion,
  extractVersion,
} from './validate-biome-schema.js';

describe('extractSchemaVersion', () => {
  it('extracts the version from a Biome $schema URL', () => {
    expect(
      extractSchemaVersion('https://biomejs.dev/schemas/2.3.14/schema.json')
    ).toBe('2.3.14');
  });

  it('returns null when the URL has no version segment', () => {
    expect(
      extractSchemaVersion('https://biomejs.dev/schemas/schema.json')
    ).toBe(null);
  });

  it('returns null for an empty or missing value', () => {
    expect(extractSchemaVersion('')).toBe(null);
    expect(extractSchemaVersion(undefined as unknown as string)).toBe(null);
  });
});

describe('extractVersion', () => {
  it('strips a caret range prefix', () => {
    expect(extractVersion('^2.3.14')).toBe('2.3.14');
  });

  it('strips a tilde range prefix', () => {
    expect(extractVersion('~2.3.14')).toBe('2.3.14');
  });

  it('returns an exact version unchanged', () => {
    expect(extractVersion('2.3.14')).toBe('2.3.14');
  });

  it('returns null for a missing range', () => {
    expect(extractVersion(null as unknown as string)).toBe(null);
  });
});
