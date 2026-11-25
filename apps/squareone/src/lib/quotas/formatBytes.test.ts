import { describe, expect, test } from 'vitest';

import { formatBytes } from './formatBytes';

describe('formatBytes', () => {
  test('scales a whole number of GiB', () => {
    expect(formatBytes(10737418240)).toBe('10 GiB');
  });

  test('uses the largest unit that keeps the value at least one', () => {
    expect(formatBytes(10485760)).toBe('10 MiB');
  });

  test('keeps one decimal place of a fractional value', () => {
    expect(formatBytes(1610612736)).toBe('1.5 GiB');
  });

  test('rounds to at most one decimal place', () => {
    // 1100 bytes is 1.07421875 KiB.
    expect(formatBytes(1100)).toBe('1.1 KiB');
  });

  test('drops a trailing .0 left by rounding', () => {
    // 1075 bytes is 1.0498046875 KiB.
    expect(formatBytes(1075)).toBe('1 KiB');
  });

  test('moves up a unit when rounding reaches 1024', () => {
    // 1048575 bytes is 1023.9990234375 KiB, which rounds to 1024 KiB.
    expect(formatBytes(1048575)).toBe('1 MiB');
  });

  test('shows a value below 1024 in whole bytes', () => {
    expect(formatBytes(500)).toBe('500 bytes');
  });

  test('uses the singular for one byte', () => {
    expect(formatBytes(1)).toBe('1 byte');
  });

  test('shows zero as 0 bytes', () => {
    expect(formatBytes(0)).toBe('0 bytes');
  });

  test('switches from bytes to KiB at 1024', () => {
    expect(formatBytes(1023)).toBe('1023 bytes');
    expect(formatBytes(1024)).toBe('1 KiB');
  });

  test('scales a typical home directory quota', () => {
    expect(formatBytes(32212254720)).toBe('30 GiB');
  });

  test('scales into TiB and PiB', () => {
    expect(formatBytes(1024 ** 4)).toBe('1 TiB');
    expect(formatBytes(2.5 * 1024 ** 5)).toBe('2.5 PiB');
  });

  test('keeps values past PiB in PiB', () => {
    expect(formatBytes(1024 ** 6)).toBe('1024 PiB');
    expect(formatBytes(3 * 1024 ** 7)).toBe('3145728 PiB');
  });
});
