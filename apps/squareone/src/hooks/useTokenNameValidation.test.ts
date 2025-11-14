import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import useTokenNameValidation from './useTokenNameValidation';

describe('useTokenNameValidation', () => {
  const existingTokenNames = ['laptop token', 'server token', 'test-token'];

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should start with valid state for empty name', () => {
    const { result } = renderHook(() =>
      useTokenNameValidation('', existingTokenNames)
    );

    expect(result.current.isValidating).toBe(false);
    expect(result.current.isValid).toBe(true);
    expect(result.current.errorMessage).toBe(null);
  });

  it('should validate unique names as valid', async () => {
    const { result } = renderHook(() =>
      useTokenNameValidation('unique name', existingTokenNames)
    );

    // Initially should be validating
    expect(result.current.isValidating).toBe(true);

    // Fast-forward debounce timer
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.isValidating).toBe(false);
    expect(result.current.isValid).toBe(true);
    expect(result.current.errorMessage).toBe(null);
  });

  it('should detect duplicate names (exact match)', async () => {
    const { result } = renderHook(() =>
      useTokenNameValidation('laptop token', existingTokenNames)
    );

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.isValidating).toBe(false);
    expect(result.current.isValid).toBe(false);
    expect(result.current.errorMessage).toBe(
      'A token with this name already exists.'
    );
  });

  it('should detect duplicate names (case insensitive)', async () => {
    const { result } = renderHook(() =>
      useTokenNameValidation('LAPTOP TOKEN', existingTokenNames)
    );

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.isValidating).toBe(false);
    expect(result.current.isValid).toBe(false);
    expect(result.current.errorMessage).toBe(
      'A token with this name already exists.'
    );
  });

  it('should detect duplicate names with whitespace differences', async () => {
    const { result } = renderHook(() =>
      useTokenNameValidation('  laptop token  ', existingTokenNames)
    );

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.isValidating).toBe(false);
    expect(result.current.isValid).toBe(false);
    expect(result.current.errorMessage).toBe(
      'A token with this name already exists.'
    );
  });

  it('should validate immediately when validateImmediately is called', () => {
    const { result } = renderHook(() =>
      useTokenNameValidation('laptop token', existingTokenNames)
    );

    // Before calling validateImmediately, it should be validating due to debounce
    expect(result.current.isValidating).toBe(true);

    act(() => {
      result.current.validateImmediately();
    });

    // After calling validateImmediately, should have immediate result
    expect(result.current.isValidating).toBe(false);
    expect(result.current.isValid).toBe(false);
    expect(result.current.errorMessage).toBe(
      'A token with this name already exists.'
    );
  });

  it('should reset validation state', () => {
    const { result } = renderHook(() =>
      useTokenNameValidation('laptop token', existingTokenNames)
    );

    act(() => {
      result.current.validateImmediately();
    });

    expect(result.current.isValid).toBe(false);

    act(() => {
      result.current.reset();
    });

    expect(result.current.isValidating).toBe(false);
    expect(result.current.isValid).toBe(true);
    expect(result.current.errorMessage).toBe(null);
  });

  it('should not validate when validateOnChange is false', () => {
    const { result } = renderHook(() =>
      useTokenNameValidation('laptop token', existingTokenNames, {
        validateOnChange: false,
      })
    );

    expect(result.current.isValidating).toBe(false);
    expect(result.current.isValid).toBe(true);
    expect(result.current.errorMessage).toBe(null);

    // Even after debounce time
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.isValidating).toBe(false);
    expect(result.current.isValid).toBe(true);
    expect(result.current.errorMessage).toBe(null);

    // But validateImmediately should still work
    act(() => {
      result.current.validateImmediately();
    });

    expect(result.current.isValid).toBe(false);
  });

  it('should use custom debounce time', () => {
    const { result } = renderHook(() =>
      useTokenNameValidation('laptop token', existingTokenNames, {
        debounceMs: 500,
      })
    );

    expect(result.current.isValidating).toBe(true);

    // Should still be validating after 300ms
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current.isValidating).toBe(true);

    // Should be done after 500ms
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current.isValidating).toBe(false);
    expect(result.current.isValid).toBe(false);
  });

  it('should re-validate when existing token names change', () => {
    const { result, rerender } = renderHook(
      ({ existingNames }) =>
        useTokenNameValidation('laptop token', existingNames),
      {
        initialProps: { existingNames: existingTokenNames },
      }
    );

    act(() => {
      result.current.validateImmediately();
    });

    expect(result.current.isValid).toBe(false);

    // Change existing names (remove the conflicting one)
    rerender({ existingNames: ['server token', 'test-token'] });

    // Should start validating due to dependency change
    expect(result.current.isValidating).toBe(true);

    // Fast-forward debounce timer to complete validation
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Should now be valid since the conflict is removed
    expect(result.current.isValidating).toBe(false);
    expect(result.current.isValid).toBe(true);
    expect(result.current.errorMessage).toBe(null);
  });

  it('should handle empty existing names array', () => {
    const { result } = renderHook(() => useTokenNameValidation('any name', []));

    // Should start validating due to non-empty name
    expect(result.current.isValidating).toBe(true);

    // Use immediate validation to bypass debouncing issues
    act(() => {
      result.current.validateImmediately();
    });

    // Should be valid (no conflicts with empty array)
    expect(result.current.isValidating).toBe(false);
    expect(result.current.isValid).toBe(true);
    expect(result.current.errorMessage).toBe(null);
  });
});
