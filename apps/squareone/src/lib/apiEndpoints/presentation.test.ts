import { describe, expect, test } from 'vitest';

import { datasetReleaseRank, orderDatasetKeys } from './presentation';

describe('datasetReleaseRank', () => {
  test('ranks full data releases above every data preview', () => {
    expect(datasetReleaseRank('dr1')).toBeGreaterThan(
      datasetReleaseRank('dp2') as number
    );
  });

  test('ranks releases numerically within a family, not lexicographically', () => {
    expect(datasetReleaseRank('dr10')).toBeGreaterThan(
      datasetReleaseRank('dr2') as number
    );
  });

  test('treats leading-zero preview digits as fractional DP0.x versions', () => {
    expect(datasetReleaseRank('dp03')).toBeCloseTo(0.3);
    expect(datasetReleaseRank('dp1')).toBeGreaterThan(
      datasetReleaseRank('dp03') as number
    );
    expect(datasetReleaseRank('dp03')).toBeGreaterThan(
      datasetReleaseRank('dp02') as number
    );
  });

  test('returns null for non-release keys', () => {
    expect(datasetReleaseRank('prompt')).toBeNull();
    expect(datasetReleaseRank('mystery')).toBeNull();
    expect(datasetReleaseRank('drx')).toBeNull();
  });
});

describe('orderDatasetKeys', () => {
  test('orders releases newest-first with prompt pinned second', () => {
    expect(orderDatasetKeys(['dp02', 'dp1', 'prompt', 'dp03', 'dp2'])).toEqual([
      'dp2',
      'prompt',
      'dp1',
      'dp03',
      'dp02',
    ]);
  });

  test('slots full data releases ahead of previews, prompt still second', () => {
    expect(orderDatasetKeys(['dp2', 'dr1', 'prompt', 'dr2'])).toEqual([
      'dr2',
      'prompt',
      'dr1',
      'dp2',
    ]);
  });

  test('appends unrecognized keys after releases, in given order', () => {
    expect(orderDatasetKeys(['zebra', 'dp1', 'aardvark'])).toEqual([
      'dp1',
      'zebra',
      'aardvark',
    ]);
  });

  test('handles prompt without any releases', () => {
    expect(orderDatasetKeys(['prompt'])).toEqual(['prompt']);
    expect(orderDatasetKeys(['prompt', 'mystery'])).toEqual([
      'mystery',
      'prompt',
    ]);
  });
});
