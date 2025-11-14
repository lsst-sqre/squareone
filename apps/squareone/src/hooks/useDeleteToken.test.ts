import { act, renderHook } from '@testing-library/react';
import { mutate } from 'swr';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import useDeleteToken from './useDeleteToken';

// Mock SWR mutate
vi.mock('swr', () => ({
  mutate: vi.fn(),
}));

// Mock useLoginInfo
vi.mock('./useLoginInfo', () => ({
  default: vi.fn(),
}));

import type { LoginInfo } from './useLoginInfo';
import useLoginInfo from './useLoginInfo';

describe('useDeleteToken', () => {
  let fetchMock: any;
  const mockLoginInfo: LoginInfo = {
    csrf: 'test-csrf-token',
    username: 'testuser',
    scopes: ['user:token'],
    config: { scopes: [] },
  };

  beforeEach(() => {
    fetchMock = vi.fn();
    global.fetch = fetchMock;
    vi.mocked(useLoginInfo).mockReturnValue({
      loginInfo: mockLoginInfo,
      isLoading: false,
      mutate: vi.fn(),
    });
    vi.mocked(mutate).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useDeleteToken());

    expect(result.current.isDeleting).toBe(false);
    expect(result.current.error).toBeUndefined();
    expect(result.current.deleteToken).toBeDefined();
  });

  it('should successfully delete a token', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 204,
    });

    const { result } = renderHook(() => useDeleteToken());

    await act(async () => {
      await result.current.deleteToken('testuser', 'gt-token-123');
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/auth/api/v1/users/testuser/tokens/gt-token-123',
      {
        method: 'DELETE',
        headers: {
          'X-CSRF-Token': 'test-csrf-token',
        },
      }
    );

    expect(mutate).toHaveBeenCalledWith('/auth/api/v1/users/testuser/tokens');
    expect(result.current.isDeleting).toBe(false);
    expect(result.current.error).toBeUndefined();
  });

  it('should set isDeleting to true during API call', async () => {
    let resolveFetch: (value: any) => void;
    const fetchPromise = new Promise((resolve) => {
      resolveFetch = resolve;
    });

    fetchMock.mockReturnValueOnce(fetchPromise);

    const { result } = renderHook(() => useDeleteToken());

    let deletePromise: Promise<any>;
    act(() => {
      deletePromise = result.current.deleteToken('testuser', 'gt-token-123');
    });

    expect(result.current.isDeleting).toBe(true);

    await act(async () => {
      resolveFetch?.({
        ok: true,
        status: 204,
      });
      await deletePromise;
    });

    expect(result.current.isDeleting).toBe(false);
  });

  it('should handle missing CSRF token', async () => {
    vi.mocked(useLoginInfo).mockReturnValue({
      loginInfo: undefined,
      isLoading: false,
      mutate: vi.fn(),
    });

    const { result } = renderHook(() => useDeleteToken());

    let error;
    await act(async () => {
      try {
        await result.current.deleteToken('testuser', 'gt-token-123');
      } catch (err) {
        error = err;
      }
    });

    expect(result.current.error).toEqual({
      status: 401,
      message: 'Authentication required. Please log in again.',
    });
    expect(error).toEqual(result.current.error);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current.isDeleting).toBe(false);
  });

  it('should handle 401 unauthorized error', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => ({ detail: 'Invalid token' }),
    });

    const { result } = renderHook(() => useDeleteToken());

    let error;
    await act(async () => {
      try {
        await result.current.deleteToken('testuser', 'gt-token-123');
      } catch (err) {
        error = err;
      }
    });

    expect(result.current.error).toEqual({
      status: 401,
      message: 'Authentication required. Please log in again.',
      details: { detail: 'Invalid token' },
    });
    expect(error).toEqual(result.current.error);
    expect(result.current.isDeleting).toBe(false);
    expect(mutate).not.toHaveBeenCalled();
  });

  it('should handle 403 forbidden error', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
      json: async () => ({ detail: 'Insufficient permissions' }),
    });

    const { result } = renderHook(() => useDeleteToken());

    let error;
    await act(async () => {
      try {
        await result.current.deleteToken('testuser', 'gt-token-123');
      } catch (err) {
        error = err;
      }
    });

    expect(result.current.error).toEqual({
      status: 403,
      message: "You don't have permission to delete this token.",
      details: { detail: 'Insufficient permissions' },
    });
    expect(error).toEqual(result.current.error);
    expect(mutate).not.toHaveBeenCalled();
  });

  it('should handle 404 not found error', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => ({ detail: 'Token does not exist' }),
    });

    const { result } = renderHook(() => useDeleteToken());

    let error;
    await act(async () => {
      try {
        await result.current.deleteToken('testuser', 'gt-token-123');
      } catch (err) {
        error = err;
      }
    });

    expect(result.current.error).toEqual({
      status: 404,
      message: 'Token not found. It may have already been deleted.',
      details: { detail: 'Token does not exist' },
    });
    expect(error).toEqual(result.current.error);
    expect(mutate).not.toHaveBeenCalled();
  });

  it('should handle 422 validation error', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 422,
      statusText: 'Unprocessable Entity',
      json: async () => ({ detail: 'Invalid token key format' }),
    });

    const { result } = renderHook(() => useDeleteToken());

    let error;
    await act(async () => {
      try {
        await result.current.deleteToken('testuser', 'invalid-key');
      } catch (err) {
        error = err;
      }
    });

    expect(result.current.error).toEqual({
      status: 422,
      message: 'Invalid request. Please try again.',
      details: { detail: 'Invalid token key format' },
    });
    expect(error).toEqual(result.current.error);
    expect(mutate).not.toHaveBeenCalled();
  });

  it('should handle error with message field instead of detail', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => ({ message: 'Server error occurred' }),
    });

    const { result } = renderHook(() => useDeleteToken());

    await act(async () => {
      try {
        await result.current.deleteToken('testuser', 'gt-token-123');
      } catch (_err) {
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

    const { result } = renderHook(() => useDeleteToken());

    let error;
    await act(async () => {
      try {
        await result.current.deleteToken('testuser', 'gt-token-123');
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
    expect(mutate).not.toHaveBeenCalled();
  });

  it('should handle network error', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Network request failed'));

    const { result } = renderHook(() => useDeleteToken());

    let error;
    await act(async () => {
      try {
        await result.current.deleteToken('testuser', 'gt-token-123');
      } catch (err) {
        error = err;
      }
    });

    expect(result.current.error).toEqual({
      status: 0,
      message: 'Failed to delete token. Please check your connection.',
    });
    expect(error).toEqual(result.current.error);
    expect(result.current.isDeleting).toBe(false);
    expect(mutate).not.toHaveBeenCalled();
  });

  it('should use correct API endpoint based on username and key', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 204,
    });

    const { result } = renderHook(() => useDeleteToken());

    await act(async () => {
      await result.current.deleteToken('differentuser', 'gt-different-token');
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/auth/api/v1/users/differentuser/tokens/gt-different-token',
      expect.any(Object)
    );
    expect(mutate).toHaveBeenCalledWith(
      '/auth/api/v1/users/differentuser/tokens'
    );
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
        status: 204,
      });

    const { result } = renderHook(() => useDeleteToken());

    await act(async () => {
      try {
        await result.current.deleteToken('testuser', 'gt-token-1');
      } catch (_err) {
        // Expected error
      }
    });

    expect(result.current.error).toBeDefined();

    await act(async () => {
      await result.current.deleteToken('testuser', 'gt-token-2');
    });

    expect(result.current.error).toBeUndefined();
  });

  it('should include CSRF token from loginInfo', async () => {
    vi.mocked(useLoginInfo).mockReturnValue({
      loginInfo: {
        csrf: 'custom-csrf-token-xyz',
        username: 'testuser',
        scopes: ['user:token'],
        config: { scopes: [] },
      },
      isLoading: false,
      mutate: vi.fn(),
    });

    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 204,
    });

    const { result } = renderHook(() => useDeleteToken());

    await act(async () => {
      await result.current.deleteToken('testuser', 'gt-token-123');
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: {
          'X-CSRF-Token': 'custom-csrf-token-xyz',
        },
      })
    );
  });

  it('should mutate SWR cache on successful deletion', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 204,
    });

    const { result } = renderHook(() => useDeleteToken());

    await act(async () => {
      await result.current.deleteToken('testuser', 'gt-token-123');
    });

    expect(mutate).toHaveBeenCalledTimes(1);
    expect(mutate).toHaveBeenCalledWith('/auth/api/v1/users/testuser/tokens');
  });

  it('should not mutate SWR cache on failed deletion', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
      json: async () => ({ detail: 'Error' }),
    });

    const { result } = renderHook(() => useDeleteToken());

    await act(async () => {
      try {
        await result.current.deleteToken('testuser', 'gt-token-123');
      } catch (_err) {
        // Expected error
      }
    });

    expect(mutate).not.toHaveBeenCalled();
  });
});
