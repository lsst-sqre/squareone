import { describe, it, expect } from 'vitest';
import { parseTokenQueryParams } from './queryParams';

describe('parseTokenQueryParams', () => {
  it('should return empty object for empty query', () => {
    const result = parseTokenQueryParams({});
    expect(result).toEqual({});
  });

  it('should parse name parameter correctly', () => {
    const result = parseTokenQueryParams({ name: 'My Token' });
    expect(result).toEqual({ name: 'My Token' });
  });

  it('should trim and filter empty name', () => {
    const result = parseTokenQueryParams({ name: '   ' });
    expect(result).toEqual({});
  });

  it('should parse single scope parameter', () => {
    const result = parseTokenQueryParams({ scope: 'read:all' });
    expect(result).toEqual({ scopes: ['read:all'] });
  });

  it('should parse comma-separated scopes', () => {
    const result = parseTokenQueryParams({
      scope: 'read:all,user:token,exec:notebook',
    });
    expect(result).toEqual({
      scopes: ['read:all', 'user:token', 'exec:notebook'],
    });
  });

  it('should parse array of scopes', () => {
    const result = parseTokenQueryParams({ scope: ['read:all', 'user:token'] });
    expect(result).toEqual({ scopes: ['read:all', 'user:token'] });
  });

  it('should parse array of scopes with comma-separated values', () => {
    const result = parseTokenQueryParams({
      scope: ['read:all,user:token', 'exec:notebook'],
    });
    expect(result).toEqual({
      scopes: ['read:all', 'user:token', 'exec:notebook'],
    });
  });

  it('should filter empty scopes', () => {
    const result = parseTokenQueryParams({ scope: 'read:all,,user:token' });
    expect(result).toEqual({ scopes: ['read:all', 'user:token'] });
  });

  it('should parse valid preset expiration', () => {
    const result = parseTokenQueryParams({ expiration: '7d' });
    expect(result).toEqual({ expiration: '7d' });
  });

  it('should parse never expiration', () => {
    const result = parseTokenQueryParams({ expiration: 'never' });
    expect(result).toEqual({ expiration: 'never' });
  });

  it('should parse valid ISO8601 expiration', () => {
    const result = parseTokenQueryParams({
      expiration: '2024-12-31T23:59:59Z',
    });
    expect(result).toEqual({ expiration: '2024-12-31T23:59:59Z' });
  });

  it('should ignore invalid expiration', () => {
    const result = parseTokenQueryParams({ expiration: 'invalid' });
    expect(result).toEqual({});
  });

  it('should parse all parameters together', () => {
    const result = parseTokenQueryParams({
      name: 'Test Token',
      scope: 'read:all,user:token',
      expiration: '30d',
    });
    expect(result).toEqual({
      name: 'Test Token',
      scopes: ['read:all', 'user:token'],
      expiration: '30d',
    });
  });

  it('should handle mixed valid and invalid parameters', () => {
    const result = parseTokenQueryParams({
      name: 'Valid Name',
      scope: 'read:all',
      expiration: 'invalid',
      other: 'ignored',
    });
    expect(result).toEqual({
      name: 'Valid Name',
      scopes: ['read:all'],
    });
  });
});
