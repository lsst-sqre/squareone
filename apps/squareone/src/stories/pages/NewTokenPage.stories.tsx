import { type LoginInfo, useLoginInfo } from '@lsst-sqre/gafaelfawr-client';
import { Note } from '@lsst-sqre/squared';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { expect, within } from 'storybook/test';
import ScopeList from '../../components/ScopeList';
import { TokenForm, type TokenFormValues } from '../../components/TokenForm';
import {
  getGrantableScopes,
  restrictToGrantableScopes,
} from '../../lib/tokens/grantableScopes';
import { parseTokenTemplateParams } from '../../lib/tokens/templateUrl';
import { requestUrl } from '../support/fetchStub';

const mockLoginInfo: LoginInfo = {
  csrf: 'mock-csrf-token-abc123',
  username: 'testuser',
  scopes: ['read:all', 'user:token', 'exec:notebook', 'write:file'],
  config: {
    scopes: [
      {
        name: 'read:all',
        description: 'Read access to all services',
      },
      {
        name: 'user:token',
        description: 'Can create and modify user tokens',
      },
      {
        name: 'exec:notebook',
        description: 'Can execute notebooks',
      },
      {
        name: 'write:file',
        description: 'Can write files',
      },
    ],
  },
};

// Store original fetch
const originalFetch = typeof window !== 'undefined' ? window.fetch : fetch;

// Mock fetch interceptor
const mockFetch = async (
  url: string | URL | Request,
  options?: RequestInit
) => {
  const urlString = requestUrl(url);

  if (urlString.includes('/auth/api/v1/login')) {
    return {
      ok: true,
      status: 200,
      json: async () => mockLoginInfo,
    } as Response;
  }

  // Fall back to original fetch for other URLs
  return originalFetch(url, options);
};

// Component that sets up fetch mocking
function MockFetchProvider({
  children,
  mockError = false,
  mockLoading = false,
}: {
  children: React.ReactNode;
  mockError?: boolean;
  mockLoading?: boolean;
}) {
  // Install the fetch mock during render (top-down, before the login query's
  // child effect fires, and after any outer provider so the innermost story
  // decorator wins) and restore it on unmount.
  if (mockError) {
    window.fetch = async (url: string | URL | Request) => {
      const urlString = requestUrl(url);
      if (urlString.includes('/auth/api/v1/login')) {
        throw new Error('Failed to load login info');
      }
      return originalFetch(url);
    };
  } else if (mockLoading) {
    window.fetch = async () => {
      // Return a promise that never resolves for loading state
      return new Promise(() => {});
    };
  } else {
    // biome-ignore lint/suspicious/noExplicitAny: Mock fetch needs to match global fetch type
    window.fetch = mockFetch as any;
  }
  useEffect(() => {
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return <>{children}</>;
}

function NewTokenPageSimulator() {
  const searchParams = useSearchParams();
  // Pass undefined for repertoireUrl since we mock fetch directly
  const {
    loginInfo,
    error: loginError,
    isLoading: loginLoading,
  } = useLoginInfo(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const templateValues = parseTokenTemplateParams(searchParams);

  const handleSubmit = async (values: TokenFormValues) => {
    setIsSubmitting(true);
    try {
      console.log('Token creation form submitted:', values);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Token creation failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    console.log('Cancel clicked');
  };

  if (loginLoading) {
    return <p>Loading…</p>;
  }

  if (loginError || !loginInfo) {
    return (
      <p>
        Failed to load authentication information. Please refresh the page or
        log in again.
      </p>
    );
  }

  // Prefill exactly as NewTokenPageClient does.
  const availableScopes = getGrantableScopes(loginInfo);
  const { values: formInitialValues, droppedScopes } =
    restrictToGrantableScopes(templateValues, availableScopes);

  return (
    <div>
      <h1>Create an RSP access token</h1>
      <p>
        Create a new access token for programmatic access to the Rubin Science
        Platform APIs. Access tokens allow you to authenticate with services
        without using your password.
      </p>
      {droppedScopes.length > 0 && (
        <Note type="warning">
          <p>
            This link requested{' '}
            <ScopeList scopes={droppedScopes} conjunction="and" />, which your
            account cannot grant.
          </p>
        </Note>
      )}
      <TokenForm
        availableScopes={availableScopes}
        initialValues={formInitialValues}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

export default {
  title: 'Pages/Settings/NewTokenPage',
  component: NewTokenPageSimulator,
  decorators: [
    // biome-ignore lint/suspicious/noExplicitAny: Storybook decorator accepts any Story component
    (Story: any) => (
      <MockFetchProvider>
        <Story />
      </MockFetchProvider>
    ),
  ],
};

export const Default = {
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/settings/tokens/new',
      },
    },
  },
};

export const WithNamePrefilled = {
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/settings/tokens/new',
        query: { name: 'My API Token' },
      },
    },
  },
};

export const WithSingleScope = {
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/settings/tokens/new',
        query: { scopes: 'read:all' },
      },
    },
  },
};

// The format template URLs (useTokenTemplateUrl) and the /api-aspect token
// links emit.
export const WithCommaDelimitedScopes = {
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/settings/tokens/new',
        query: { scopes: 'read:all,user:token' },
      },
    },
  },
};

// A template URL (e.g. an /api-aspect token link) can request a scope the
// user does not hold. The page prefills only the grantable scopes and names the
// dropped one in a notice above the form.
export const WithUnavailableScope = {
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/settings/tokens/new',
        query: { scopes: 'read:all,read:image' },
      },
    },
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText(/cannot grant/i)).toHaveTextContent(
      'This link requested read:image, which your account cannot grant.'
    );
    await expect(
      canvas.getByRole('checkbox', { name: /read:all/ })
    ).toBeChecked();
  },
};

// Legacy template URLs repeated a singular `scope` parameter; the page still
// accepts them.
export const WithRepeatedScopeParameters = {
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/settings/tokens/new',
        query: [
          ['scope', 'read:all'],
          ['scope', 'user:token'],
          ['scope', 'exec:notebook'],
        ],
      },
    },
  },
};

// A `scopes` list and legacy `scope` parameters together are merged.
export const WithMixedScopeFormats = {
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/settings/tokens/new',
        query: [
          ['scopes', 'read:all,user:token'],
          ['scope', 'exec:notebook'],
        ],
      },
    },
  },
};

export const WithExpirationPrefilled = {
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/settings/tokens/new',
        query: { expiration: '30d' },
      },
    },
  },
};

export const WithAllParametersCombined = {
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/settings/tokens/new',
        query: [
          ['name', 'Complete Token'],
          ['scopes', 'read:all,user:token'],
          ['expiration', '7d'],
        ],
      },
    },
  },
};

export const WithInvalidParameters = {
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/settings/tokens/new',
        query: {
          name: 'Valid Name',
          scopes: 'read:all',
          expiration: 'invalid-expiration',
          randomParam: 'should-be-ignored',
        },
      },
    },
  },
};

export const WithEmptyScopeValues = {
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/settings/tokens/new',
        query: { scopes: 'read:all,,user:token' },
      },
    },
  },
};

export const WithWhitespaceInScopes = {
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/settings/tokens/new',
        query: { scopes: ' read:all , user:token ' },
      },
    },
  },
};

export const LoadingState = {
  decorators: [
    // biome-ignore lint/suspicious/noExplicitAny: Storybook decorator accepts any Story component
    (Story: any) => (
      <MockFetchProvider mockLoading={true}>
        <Story />
      </MockFetchProvider>
    ),
  ],
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/settings/tokens/new',
      },
    },
  },
};

export const ErrorState = {
  decorators: [
    // biome-ignore lint/suspicious/noExplicitAny: Storybook decorator accepts any Story component
    (Story: any) => (
      <MockFetchProvider mockError={true}>
        <Story />
      </MockFetchProvider>
    ),
  ],
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/settings/tokens/new',
      },
    },
  },
};

// Mock with limited user scopes to demonstrate scope filtering
const limitedScopeMockLoginInfo: LoginInfo = {
  csrf: 'mock-csrf-token-limited',
  username: 'limiteduser',
  scopes: ['read:all', 'user:token'], // User only has 2 scopes
  config: {
    scopes: [
      {
        name: 'read:all',
        description: 'Read access to all services',
      },
      {
        name: 'user:token',
        description: 'Can create and modify user tokens',
      },
      {
        name: 'exec:notebook',
        description: 'Can execute notebooks',
      },
      {
        name: 'write:file',
        description: 'Can write files',
      },
      {
        name: 'admin:token',
        description: 'Can manage all tokens',
      },
    ], // System has 5 scopes available
  },
};

const mockFetchWithLimitedScopes = async (
  url: string | URL | Request,
  options?: RequestInit
) => {
  const urlString = requestUrl(url);

  if (urlString.includes('/auth/api/v1/login')) {
    return {
      ok: true,
      status: 200,
      json: async () => limitedScopeMockLoginInfo,
    } as Response;
  }

  return originalFetch(url, options);
};

function LimitedScopesMockProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Installed during render, as in MockFetchProvider.
  // biome-ignore lint/suspicious/noExplicitAny: Mock fetch needs to match global fetch type
  window.fetch = mockFetchWithLimitedScopes as any;
  useEffect(() => {
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return <>{children}</>;
}

export const LimitedScopes = {
  decorators: [
    // biome-ignore lint/suspicious/noExplicitAny: Storybook decorator accepts any Story component
    (Story: any) => (
      <LimitedScopesMockProvider>
        <Story />
      </LimitedScopesMockProvider>
    ),
  ],
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/settings/tokens/new',
      },
    },
  },
};
