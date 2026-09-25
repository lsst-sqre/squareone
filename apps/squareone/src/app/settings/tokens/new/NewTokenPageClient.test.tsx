import * as gafaelfawrClient from '@lsst-sqre/gafaelfawr-client';
import { render, renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { TokenFormValues } from '../../../../components/TokenForm';
import * as useRepertoireUrlModule from '../../../../hooks/useRepertoireUrl';

vi.mock('@lsst-sqre/gafaelfawr-client', async (importOriginal) => {
  const actual = await importOriginal<typeof gafaelfawrClient>();
  return {
    ...actual,
    useLoginInfo: vi.fn(),
    useCreateToken: vi.fn(),
    useUserTokens: vi.fn(),
  };
});
vi.mock('../../../../hooks/useRepertoireUrl');
vi.mock('../../../../hooks/useTokenTemplateUrl', () => ({
  default: () => 'https://example.com/template',
}));

// AuthRequired gates on user info; render children directly in tests.
vi.mock('../../../../components/AuthRequired', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Search parameters the page reads; reassigned per test to exercise prefill.
let mockSearchParams = new URLSearchParams();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => mockSearchParams,
}));

// Pin the app's Sentry reporter so we can assert it fires on submit failure.
const mockReportError = vi.fn();
vi.mock('@/lib/sentry/reportError', () => ({
  makeReportError: () => mockReportError,
}));

// Replace the form with a minimal control that submits fixed values so the
// test exercises the page's submit handler, not react-hook-form. Its props are
// recorded so tests can assert the prefill values the page passes in.
const mockTokenFormProps = vi.fn();
vi.mock('../../../../components/TokenForm', () => ({
  TokenForm: (props: {
    initialValues?: Partial<TokenFormValues>;
    onSubmit: (values: TokenFormValues) => Promise<void>;
  }) => {
    mockTokenFormProps(props);
    const { onSubmit } = props;
    return (
      <button
        type="button"
        onClick={() =>
          onSubmit({
            name: 'my-token',
            scopes: ['read:tap'],
            expiration: { type: 'never' },
          })
        }
      >
        Submit token
      </button>
    );
  },
}));

import NewTokenPageClient from './NewTokenPageClient';

const mockUseLoginInfo = vi.mocked(gafaelfawrClient.useLoginInfo);
const mockUseCreateToken = vi.mocked(gafaelfawrClient.useCreateToken);
const mockUseUserTokens = vi.mocked(gafaelfawrClient.useUserTokens);
const mockUseRepertoireUrl = vi.mocked(useRepertoireUrlModule.useRepertoireUrl);

const mockCreateToken = vi.fn();

describe('NewTokenPageClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();

    mockUseRepertoireUrl.mockReturnValue(undefined);

    mockUseLoginInfo.mockReturnValue({
      loginInfo: {
        username: 'testuser',
        scopes: ['read:tap'],
        config: {
          scopes: [{ name: 'read:tap', description: 'Read TAP' }],
        },
      },
      error: null,
      isLoading: false,
    } as unknown as ReturnType<typeof gafaelfawrClient.useLoginInfo>);

    mockUseCreateToken.mockReturnValue({
      createToken: mockCreateToken,
      isCreating: false,
      error: null,
      reset: vi.fn(),
    } as unknown as ReturnType<typeof gafaelfawrClient.useCreateToken>);

    mockUseUserTokens.mockReturnValue({
      tokens: [],
      error: null,
      isLoading: false,
      invalidate: vi.fn(),
    } as unknown as ReturnType<typeof gafaelfawrClient.useUserTokens>);
  });

  it('reports the exception when token creation fails', async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const error = new Error('Creation failed');
    mockCreateToken.mockRejectedValue(error);

    render(<NewTokenPageClient />);

    await user.click(screen.getByRole('button', { name: /submit token/i }));

    await waitFor(() => {
      expect(mockReportError).toHaveBeenCalledWith(
        error,
        expect.objectContaining({ site: 'new-token-submit' })
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it('does not report when token creation succeeds', async () => {
    const user = userEvent.setup();
    mockCreateToken.mockResolvedValue({ token: 'gt-created' });

    render(<NewTokenPageClient />);

    await user.click(screen.getByRole('button', { name: /submit token/i }));

    await waitFor(() => {
      expect(mockCreateToken).toHaveBeenCalled();
    });
    expect(mockReportError).not.toHaveBeenCalled();
  });

  it('prefills the form with the comma-separated scopes parameter', () => {
    mockSearchParams = new URLSearchParams('scopes=read:tap,read:image');

    render(<NewTokenPageClient />);

    expect(mockTokenFormProps).toHaveBeenLastCalledWith(
      expect.objectContaining({
        initialValues: { scopes: ['read:tap', 'read:image'] },
      })
    );
  });

  it('prefills the form with legacy repeated scope parameters', () => {
    mockSearchParams = new URLSearchParams(
      'scope=read%3Atap&scope=read%3Aimage'
    );

    render(<NewTokenPageClient />);

    expect(mockTokenFormProps).toHaveBeenLastCalledWith(
      expect.objectContaining({
        initialValues: { scopes: ['read:tap', 'read:image'] },
      })
    );
  });

  it('prefills the form from a useTokenTemplateUrl template URL', async () => {
    // This file mocks the hook for the success modal; round-trip the real one.
    const { default: useRealTokenTemplateUrl } = await vi.importActual<
      typeof import('../../../../hooks/useTokenTemplateUrl')
    >('../../../../hooks/useTokenTemplateUrl');
    const values: TokenFormValues = {
      name: 'My API token',
      scopes: ['read:image', 'read:tap'],
      expiration: { type: 'preset', value: '30d' },
    };
    const { result } = renderHook(() =>
      useRealTokenTemplateUrl('https://example.com/settings/tokens/new', values)
    );
    mockSearchParams = new URL(result.current).searchParams;

    render(<NewTokenPageClient />);

    expect(mockTokenFormProps).toHaveBeenLastCalledWith(
      expect.objectContaining({ initialValues: values })
    );
  });
});
