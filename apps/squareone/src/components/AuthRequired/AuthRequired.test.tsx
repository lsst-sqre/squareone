import { render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import AuthRequired from './AuthRequired';

// Mock the hooks
vi.mock('@lsst-sqre/gafaelfawr-client', () => ({
  useUserInfo: vi.fn(),
}));

vi.mock('../../hooks/useRepertoireUrl', () => ({
  useRepertoireUrl: vi.fn(() => undefined),
}));

import type { UseUserInfoReturn } from '@lsst-sqre/gafaelfawr-client';
// Import after mocking
import { useUserInfo } from '@lsst-sqre/gafaelfawr-client';

// Helper to create mock return values
function createMockUserInfoReturn(overrides: {
  isLoading?: boolean;
  isLoggedIn?: boolean;
  isPending?: boolean;
}): UseUserInfoReturn {
  return {
    userInfo: overrides.isLoggedIn ? { username: 'testuser' } : undefined,
    query: null,
    isLoggedIn: overrides.isLoggedIn ?? false,
    isLoading: overrides.isLoading ?? false,
    isPending: overrides.isPending ?? false,
    error: null,
    refetch: vi.fn(),
  };
}

describe('AuthRequired', () => {
  // Store original window.location
  const originalLocation = window.location;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        ...originalLocation,
        href: 'http://localhost:3000/settings/tokens',
      },
      writable: true,
    });
  });

  afterEach(() => {
    // Restore window.location
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });
  });

  test('renders loading state while checking auth', () => {
    vi.mocked(useUserInfo).mockReturnValue(
      createMockUserInfoReturn({ isLoading: true, isLoggedIn: false })
    );

    render(<AuthRequired>Content</AuthRequired>);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  test('renders children when authenticated', () => {
    vi.mocked(useUserInfo).mockReturnValue(
      createMockUserInfoReturn({ isLoading: false, isLoggedIn: true })
    );

    render(<AuthRequired>Protected Content</AuthRequired>);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  test('renders custom loading fallback when provided', () => {
    vi.mocked(useUserInfo).mockReturnValue(
      createMockUserInfoReturn({ isLoading: true, isLoggedIn: false })
    );

    render(
      <AuthRequired loadingFallback={<div>Custom Loading State</div>}>
        Content
      </AuthRequired>
    );
    expect(screen.getByText('Custom Loading State')).toBeInTheDocument();
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  test('redirects to login when not authenticated', () => {
    vi.mocked(useUserInfo).mockReturnValue(
      createMockUserInfoReturn({ isLoading: false, isLoggedIn: false })
    );

    render(<AuthRequired>Content</AuthRequired>);

    // Should have redirected to login
    expect(window.location.href).toContain('/login');
    expect(window.location.href).toContain('rd=');
  });

  test('does not render children when redirecting', () => {
    vi.mocked(useUserInfo).mockReturnValue(
      createMockUserInfoReturn({ isLoading: false, isLoggedIn: false })
    );

    const { container } = render(<AuthRequired>Content</AuthRequired>);

    // Should render nothing (null) when redirecting
    expect(container).toBeEmptyDOMElement();
  });

  test('renders complex children when authenticated', () => {
    vi.mocked(useUserInfo).mockReturnValue(
      createMockUserInfoReturn({ isLoading: false, isLoggedIn: true })
    );

    render(
      <AuthRequired>
        <div data-testid="wrapper">
          <h1>Page Title</h1>
          <p>Page content</p>
        </div>
      </AuthRequired>
    );

    expect(screen.getByTestId('wrapper')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Page Title' })
    ).toBeInTheDocument();
    expect(screen.getByText('Page content')).toBeInTheDocument();
  });
});
