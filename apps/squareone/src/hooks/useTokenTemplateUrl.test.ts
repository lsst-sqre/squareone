import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import useTokenTemplateUrl from './useTokenTemplateUrl';
import type { TokenFormValues } from '../components/TokenForm';

/**
 * Test suite for useTokenTemplateUrl hook.
 *
 * Tests the generation of shareable template URLs for token creation forms,
 * including query parameter encoding, whitespace handling, and memoization.
 */
describe('useTokenTemplateUrl', () => {
  const baseUrl = 'https://example.com/settings/tokens/new';

  it('returns base URL with only expiration when other values are empty', () => {
    const values: TokenFormValues = {
      name: '',
      scopes: [],
      expiration: { type: 'never' },
    };

    const { result } = renderHook(() => useTokenTemplateUrl(baseUrl, values));

    expect(result.current).toBe(
      'https://example.com/settings/tokens/new?expiration=never'
    );
  });

  it('includes name parameter when provided', () => {
    const values: TokenFormValues = {
      name: 'My Token',
      scopes: [],
      expiration: { type: 'never' },
    };

    const { result } = renderHook(() => useTokenTemplateUrl(baseUrl, values));

    expect(result.current).toBe(
      'https://example.com/settings/tokens/new?name=My+Token&expiration=never'
    );
  });

  it('trims whitespace from name parameter', () => {
    const values: TokenFormValues = {
      name: '  My Token  ',
      scopes: [],
      expiration: { type: 'never' },
    };

    const { result } = renderHook(() => useTokenTemplateUrl(baseUrl, values));

    expect(result.current).toBe(
      'https://example.com/settings/tokens/new?name=My+Token&expiration=never'
    );
  });

  it('excludes empty or whitespace-only name', () => {
    const values: TokenFormValues = {
      name: '   ',
      scopes: [],
      expiration: { type: 'never' },
    };

    const { result } = renderHook(() => useTokenTemplateUrl(baseUrl, values));

    expect(result.current).toBe(
      'https://example.com/settings/tokens/new?expiration=never'
    );
  });

  it('includes single scope parameter', () => {
    const values: TokenFormValues = {
      name: '',
      scopes: ['read:image'],
      expiration: { type: 'never' },
    };

    const { result } = renderHook(() => useTokenTemplateUrl(baseUrl, values));

    expect(result.current).toBe(
      'https://example.com/settings/tokens/new?scope=read%3Aimage&expiration=never'
    );
  });

  it('includes multiple scope parameters', () => {
    const values: TokenFormValues = {
      name: '',
      scopes: ['read:image', 'write:notebook', 'user:token'],
      expiration: { type: 'never' },
    };

    const { result } = renderHook(() => useTokenTemplateUrl(baseUrl, values));

    expect(result.current).toBe(
      'https://example.com/settings/tokens/new?scope=read%3Aimage&scope=write%3Anotebook&scope=user%3Atoken&expiration=never'
    );
  });

  it('includes expiration=never when type is never', () => {
    const values: TokenFormValues = {
      name: '',
      scopes: [],
      expiration: { type: 'never' },
    };

    const { result } = renderHook(() => useTokenTemplateUrl(baseUrl, values));

    expect(result.current).toBe(
      'https://example.com/settings/tokens/new?expiration=never'
    );
  });

  it('includes preset expiration value', () => {
    const values: TokenFormValues = {
      name: '',
      scopes: [],
      expiration: { type: 'preset', value: '30d' },
    };

    const { result } = renderHook(() => useTokenTemplateUrl(baseUrl, values));

    expect(result.current).toBe(
      'https://example.com/settings/tokens/new?expiration=30d'
    );
  });

  it('includes all parameters when provided', () => {
    const values: TokenFormValues = {
      name: 'Test Token',
      scopes: ['read:all', 'user:token'],
      expiration: { type: 'preset', value: '7d' },
    };

    const { result } = renderHook(() => useTokenTemplateUrl(baseUrl, values));

    expect(result.current).toBe(
      'https://example.com/settings/tokens/new?name=Test+Token&scope=read%3Aall&scope=user%3Atoken&expiration=7d'
    );
  });

  it('handles special characters in name correctly', () => {
    const values: TokenFormValues = {
      name: 'My Token & More!',
      scopes: [],
      expiration: { type: 'never' },
    };

    const { result } = renderHook(() => useTokenTemplateUrl(baseUrl, values));

    expect(result.current).toBe(
      'https://example.com/settings/tokens/new?name=My+Token+%26+More%21&expiration=never'
    );
  });

  it('memoizes result when values do not change', () => {
    const values: TokenFormValues = {
      name: 'Test',
      scopes: ['read:all'],
      expiration: { type: 'preset', value: '30d' },
    };

    const { result, rerender } = renderHook(
      ({ baseUrl, values }) => useTokenTemplateUrl(baseUrl, values),
      {
        initialProps: { baseUrl, values },
      }
    );

    const firstResult = result.current;
    rerender({ baseUrl, values });
    const secondResult = result.current;

    expect(firstResult).toBe(secondResult);
  });

  it('updates result when values change', () => {
    const initialValues: TokenFormValues = {
      name: 'Test',
      scopes: ['read:all'],
      expiration: { type: 'preset', value: '30d' },
    };

    const { result, rerender } = renderHook(
      ({ baseUrl, values }) => useTokenTemplateUrl(baseUrl, values),
      {
        initialProps: { baseUrl, values: initialValues },
      }
    );

    const firstResult = result.current;

    const updatedValues: TokenFormValues = {
      name: 'Updated',
      scopes: ['read:all'],
      expiration: { type: 'preset', value: '30d' },
    };

    rerender({ baseUrl, values: updatedValues });
    const secondResult = result.current;

    expect(firstResult).not.toBe(secondResult);
    expect(secondResult).toContain('name=Updated');
  });

  it('handles empty scopes array', () => {
    const values: TokenFormValues = {
      name: 'Test',
      scopes: [],
      expiration: { type: 'preset', value: '1d' },
    };

    const { result } = renderHook(() => useTokenTemplateUrl(baseUrl, values));

    expect(result.current).toBe(
      'https://example.com/settings/tokens/new?name=Test&expiration=1d'
    );
  });

  it('works with different baseUrl values', () => {
    const differentBaseUrl = 'http://localhost:3000/tokens/create';
    const values: TokenFormValues = {
      name: 'Test',
      scopes: ['read:all'],
      expiration: { type: 'preset', value: '90d' },
    };

    const { result } = renderHook(() =>
      useTokenTemplateUrl(differentBaseUrl, values)
    );

    expect(result.current).toBe(
      'http://localhost:3000/tokens/create?name=Test&scope=read%3Aall&expiration=90d'
    );
  });
});
