import { afterEach, describe, expect, it, vi } from 'vitest';
import { defaultLogger } from './logger';

describe('defaultLogger', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('routes debug to console.log with message first, object second', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    defaultLogger.debug({ a: 1 }, 'hello');
    expect(spy).toHaveBeenCalledWith('hello', { a: 1 });
  });

  it('routes warn to console.warn', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    defaultLogger.warn({ b: 2 }, 'warned');
    expect(spy).toHaveBeenCalledWith('warned', { b: 2 });
  });

  it('routes error to console.error', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    defaultLogger.error({ c: 3 }, 'failed');
    expect(spy).toHaveBeenCalledWith('failed', { c: 3 });
  });
});
