import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  RERUN_WINDOW_MS,
  recordRerun,
  resetTimesSquareReruns,
  resolveExecutionState,
} from './timesSquareExecutionStore';

afterEach(() => {
  resetTimesSquareReruns();
  vi.useRealTimers();
});

describe('resolveExecutionState', () => {
  it('maps the magic `a` values to execution states', () => {
    expect(resolveExecutionState('mypage', '1')).toBe('complete');
    expect(resolveExecutionState('mypage', '2')).toBe('in_progress');
    expect(resolveExecutionState('mypage', '3')).toBe('failed');
    expect(resolveExecutionState('mypage', '4')).toBe('idle');
  });

  it('reports a re-running instance as in progress until the window elapses', () => {
    vi.useFakeTimers();

    recordRerun('mypage', '3');
    expect(resolveExecutionState('mypage', '3')).toBe('in_progress');

    vi.advanceTimersByTime(RERUN_WINDOW_MS + 1);
    expect(resolveExecutionState('mypage', '3')).toBe('failed');
  });

  it('scopes a re-run to its own page instance', () => {
    recordRerun('mypage', '3');

    expect(resolveExecutionState('mypage', '3')).toBe('in_progress');
    expect(resolveExecutionState('otherpage', '3')).toBe('failed');
    expect(resolveExecutionState('mypage', '1')).toBe('complete');
  });
});
