import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CreateTokenParams, ValidationError } from './useTokenCreation';
import useTokenCreation from './useTokenCreation';

describe('useTokenCreation', () => {
  let fetchMock: any;

  beforeEach(() => {
    fetchMock = vi.fn();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const defaultParams: CreateTokenParams = {
    username: 'testuser',
    csrf: 'test-csrf-token',
    tokenName: 'Test Token',
    scopes: ['read:all', 'user:token'],
    expires: '2024-12-31T23:59:59Z',
  };

  const expectedEpochExpires = Math.floor(
    new Date('2024-12-31T23:59:59Z').getTime() / 1000
  );

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useTokenCreation());

    expect(result.current.isCreating).toBe(false);
    expect(result.current.error).toBeUndefined();
    expect(result.current.createToken).toBeDefined();
    expect(result.current.reset).toBeDefined();
  });

  it('should successfully create a token', async () => {
    const mockResponse = { token: 'gt-test-token-123' };
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useTokenCreation());

    let tokenResponse;
    await act(async () => {
      tokenResponse = await result.current.createToken(defaultParams);
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/auth/api/v1/users/testuser/tokens',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': 'test-csrf-token',
        },
        body: JSON.stringify({
          token_name: 'Test Token',
          scopes: ['read:all', 'user:token'],
          expires: expectedEpochExpires,
        }),
      }
    );

    expect(tokenResponse).toEqual(mockResponse);
    expect(result.current.isCreating).toBe(false);
    expect(result.current.error).toBeUndefined();
  });

  it('should handle null expiration', async () => {
    const mockResponse = { token: 'gt-test-token-123' };
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useTokenCreation());

    await act(async () => {
      await result.current.createToken({ ...defaultParams, expires: null });
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/auth/api/v1/users/testuser/tokens',
      expect.objectContaining({
        body: JSON.stringify({
          token_name: 'Test Token',
          scopes: ['read:all', 'user:token'],
          expires: null,
        }),
      })
    );
  });

  it('should set isCreating to true during API call', async () => {
    const mockResponse = { token: 'gt-test-token-123' };
    let resolveFetch: (value: any) => void;
    const fetchPromise = new Promise((resolve) => {
      resolveFetch = resolve;
    });

    fetchMock.mockReturnValueOnce(fetchPromise);

    const { result } = renderHook(() => useTokenCreation());

    let createPromise: Promise<any>;
    act(() => {
      createPromise = result.current.createToken(defaultParams);
    });

    expect(result.current.isCreating).toBe(true);

    await act(async () => {
      resolveFetch!({
        ok: true,
        json: async () => mockResponse,
      });
      await createPromise;
    });

    expect(result.current.isCreating).toBe(false);
  });

  it('should handle 401 unauthorized error', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => ({ detail: 'Authentication required' }),
    });

    const { result } = renderHook(() => useTokenCreation());

    let error;
    await act(async () => {
      try {
        await result.current.createToken(defaultParams);
      } catch (err) {
        error = err;
      }
    });

    expect(result.current.error).toEqual({
      status: 401,
      message: 'Authentication required',
      details: { detail: 'Authentication required' },
    });
    expect(error).toEqual(result.current.error);
    expect(result.current.isCreating).toBe(false);
  });

  it('should handle 403 forbidden error', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
      json: async () => ({ detail: 'Insufficient permissions' }),
    });

    const { result } = renderHook(() => useTokenCreation());

    let error;
    await act(async () => {
      try {
        await result.current.createToken(defaultParams);
      } catch (err) {
        error = err;
      }
    });

    expect(result.current.error).toEqual({
      status: 403,
      message: 'Insufficient permissions',
      details: { detail: 'Insufficient permissions' },
    });
    expect(error).toEqual(result.current.error);
  });

  it('should handle 422 validation error', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 422,
      statusText: 'Unprocessable Entity',
      json: async () => ({
        detail: 'Invalid token name',
        errors: { token_name: ['Name is too long'] },
      }),
    });

    const { result } = renderHook(() => useTokenCreation());

    let error;
    await act(async () => {
      try {
        await result.current.createToken(defaultParams);
      } catch (err) {
        error = err;
      }
    });

    expect(result.current.error).toEqual({
      status: 422,
      message: 'Invalid token name',
      details: {
        detail: 'Invalid token name',
        errors: { token_name: ['Name is too long'] },
      },
    });
    expect(error).toEqual(result.current.error);
  });

  it('should handle error with message field instead of detail', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => ({ message: 'Server error occurred' }),
    });

    const { result } = renderHook(() => useTokenCreation());

    await act(async () => {
      try {
        await result.current.createToken(defaultParams);
      } catch (err) {
        // Expected error
      }
    });

    expect(result.current.error?.message).toBe('Server error occurred');
  });

  it('should handle error with no JSON body', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => {
        throw new Error('No JSON');
      },
    });

    const { result } = renderHook(() => useTokenCreation());

    let error;
    await act(async () => {
      try {
        await result.current.createToken(defaultParams);
      } catch (err) {
        error = err;
      }
    });

    expect(result.current.error).toEqual({
      status: 500,
      message: 'Internal Server Error',
      details: {},
    });
    expect(error).toEqual(result.current.error);
  });

  it('should handle network error', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Network request failed'));

    const { result } = renderHook(() => useTokenCreation());

    let error;
    await act(async () => {
      try {
        await result.current.createToken(defaultParams);
      } catch (err) {
        error = err;
      }
    });

    expect(result.current.error).toEqual({
      status: 0,
      message: 'Network error. Please check your connection and try again.',
    });
    expect(error).toEqual(result.current.error);
    expect(result.current.isCreating).toBe(false);
  });

  it('should reset error state', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
      json: async () => ({ detail: 'Error' }),
    });

    const { result } = renderHook(() => useTokenCreation());

    await act(async () => {
      try {
        await result.current.createToken(defaultParams);
      } catch (err) {
        // Expected error
      }
    });

    expect(result.current.error).toBeDefined();

    act(() => {
      result.current.reset();
    });

    expect(result.current.error).toBeUndefined();
    expect(result.current.isCreating).toBe(false);
  });

  it('should clear error on new request', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: async () => ({ detail: 'Error' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'gt-test-token' }),
      });

    const { result } = renderHook(() => useTokenCreation());

    await act(async () => {
      try {
        await result.current.createToken(defaultParams);
      } catch (err) {
        // Expected error
      }
    });

    expect(result.current.error).toBeDefined();

    await act(async () => {
      await result.current.createToken(defaultParams);
    });

    expect(result.current.error).toBeUndefined();
  });

  it('should use correct API endpoint based on username', async () => {
    const mockResponse = { token: 'gt-test-token-123' };
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useTokenCreation());

    await act(async () => {
      await result.current.createToken({
        ...defaultParams,
        username: 'differentuser',
      });
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/auth/api/v1/users/differentuser/tokens',
      expect.any(Object)
    );
  });

  it('should include all scopes in request', async () => {
    const mockResponse = { token: 'gt-test-token-123' };
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useTokenCreation());

    const scopes = ['read:all', 'write:all', 'admin:token', 'user:token'];

    await act(async () => {
      await result.current.createToken({ ...defaultParams, scopes });
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: JSON.stringify({
          token_name: 'Test Token',
          scopes,
          expires: expectedEpochExpires,
        }),
      })
    );
  });

  it('should convert ISO8601 datetime to epoch timestamp', async () => {
    const mockResponse = { token: 'gt-test-token-123' };
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useTokenCreation());

    const isoDate = '2025-06-15T14:30:00Z';
    const expectedEpoch = Math.floor(new Date(isoDate).getTime() / 1000);

    await act(async () => {
      await result.current.createToken({ ...defaultParams, expires: isoDate });
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: JSON.stringify({
          token_name: 'Test Token',
          scopes: ['read:all', 'user:token'],
          expires: expectedEpoch,
        }),
      })
    );
  });

  describe('validation error formatting', () => {
    it('should format array of Pydantic validation errors', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 422,
        statusText: 'Unprocessable Entity',
        json: async () => ({
          detail: [
            {
              msg: 'String should have at most 64 characters',
              type: 'string_too_long',
              loc: ['body', 'token_name'],
            },
            {
              msg: 'Invalid scope format',
              type: 'value_error',
              loc: ['body', 'scopes', 0],
            },
          ],
        }),
      });

      const { result } = renderHook(() => useTokenCreation());

      await act(async () => {
        try {
          await result.current.createToken(defaultParams);
        } catch (err) {
          // Expected error
        }
      });

      expect(result.current.error?.message).toBe(
        'body.token_name: String should have at most 64 characters; body.scopes.0: Invalid scope format'
      );
      expect(result.current.error?.status).toBe(422);
    });

    it('should format single Pydantic validation error object', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 422,
        statusText: 'Unprocessable Entity',
        json: async () => ({
          detail: {
            msg: 'Token name already exists',
            type: 'value_error.duplicate',
            loc: ['body', 'token_name'],
          },
        }),
      });

      const { result } = renderHook(() => useTokenCreation());

      await act(async () => {
        try {
          await result.current.createToken(defaultParams);
        } catch (err) {
          // Expected error
        }
      });

      expect(result.current.error?.message).toBe('Token name already exists');
      expect(result.current.error?.status).toBe(422);
    });

    it('should handle validation error without location field', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 422,
        statusText: 'Unprocessable Entity',
        json: async () => ({
          detail: [
            {
              msg: 'General validation error',
              type: 'value_error',
            },
          ],
        }),
      });

      const { result } = renderHook(() => useTokenCreation());

      await act(async () => {
        try {
          await result.current.createToken(defaultParams);
        } catch (err) {
          // Expected error
        }
      });

      expect(result.current.error?.message).toBe('General validation error');
    });

    it('should handle empty validation error array', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 422,
        statusText: 'Unprocessable Entity',
        json: async () => ({
          detail: [] as ValidationError[],
        }),
      });

      const { result } = renderHook(() => useTokenCreation());

      await act(async () => {
        try {
          await result.current.createToken(defaultParams);
        } catch (err) {
          // Expected error
        }
      });

      expect(result.current.error?.message).toBe('');
    });

    it('should handle mixed array with validation errors and strings', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 422,
        statusText: 'Unprocessable Entity',
        json: async () => ({
          detail: [
            {
              msg: 'Field is required',
              type: 'value_error.missing',
              loc: ['body', 'expires'],
            },
            'Additional validation context',
          ],
        }),
      });

      const { result } = renderHook(() => useTokenCreation());

      await act(async () => {
        try {
          await result.current.createToken(defaultParams);
        } catch (err) {
          // Expected error
        }
      });

      expect(result.current.error?.message).toBe(
        'body.expires: Field is required; Additional validation context'
      );
    });

    it('should handle deeply nested location arrays', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 422,
        statusText: 'Unprocessable Entity',
        json: async () => ({
          detail: [
            {
              msg: 'Invalid value',
              type: 'value_error',
              loc: ['body', 'config', 'settings', 'feature', 'enabled'],
            },
          ],
        }),
      });

      const { result } = renderHook(() => useTokenCreation());

      await act(async () => {
        try {
          await result.current.createToken(defaultParams);
        } catch (err) {
          // Expected error
        }
      });

      expect(result.current.error?.message).toBe(
        'body.config.settings.feature.enabled: Invalid value'
      );
    });

    it('should use fallback message for undefined error detail', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({}),
      });

      const { result } = renderHook(() => useTokenCreation());

      await act(async () => {
        try {
          await result.current.createToken(defaultParams);
        } catch (err) {
          // Expected error
        }
      });

      expect(result.current.error?.message).toBe(
        'An error occurred while creating the token.'
      );
    });

    it('should use fallback message for null error detail', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({}),
      });

      const { result } = renderHook(() => useTokenCreation());

      await act(async () => {
        try {
          await result.current.createToken(defaultParams);
        } catch (err) {
          // Expected error
        }
      });

      expect(result.current.error?.message).toBe(
        'An error occurred while creating the token.'
      );
    });

    it('should use fallback message for numeric error detail', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({
          detail: 42,
        }),
      });

      const { result } = renderHook(() => useTokenCreation());

      await act(async () => {
        try {
          await result.current.createToken(defaultParams);
        } catch (err) {
          // Expected error
        }
      });

      expect(result.current.error?.message).toBe(
        'An error occurred while creating the token.'
      );
    });
  });
});
