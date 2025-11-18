import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { TokenForm, type TokenFormValues } from '../../components/TokenForm';
import type { LoginInfo } from '../../hooks/useLoginInfo';
import useLoginInfo from '../../hooks/useLoginInfo';
import { parseExpirationFromQuery } from '../../lib/tokens/expiration';
import { parseTokenQueryParams } from '../../lib/tokens/queryParams';

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
  const urlString =
    typeof url === 'string'
      ? url
      : url instanceof URL
        ? url.toString()
        : url.url;

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
  useEffect(() => {
    if (mockError) {
      window.fetch = async (url: string | URL | Request) => {
        const urlString =
          typeof url === 'string'
            ? url
            : url instanceof URL
              ? url.toString()
              : url.url;
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

    return () => {
      window.fetch = originalFetch;
    };
  }, [mockError, mockLoading]);

  return <>{children}</>;
}

function NewTokenPageSimulator() {
  const router = useRouter();
  const {
    loginInfo,
    error: loginError,
    isLoading: loginLoading,
  } = useLoginInfo();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryParams = parseTokenQueryParams(router.query);
  const formInitialValues: Partial<TokenFormValues> = {};

  if (queryParams?.name) {
    formInitialValues.name = queryParams.name;
  }

  if (queryParams?.scopes && Array.isArray(queryParams.scopes)) {
    formInitialValues.scopes = queryParams.scopes;
  }

  if (queryParams?.expiration) {
    const parsedExpiration = parseExpirationFromQuery(queryParams.expiration);
    if (parsedExpiration) {
      formInitialValues.expiration = parsedExpiration;
    }
  }

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

  return (
    <div>
      <h1>Create an RSP access token</h1>
      <p>
        Create a new access token for programmatic access to the Rubin Science
        Platform APIs. Access tokens allow you to authenticate with services
        without using your password.
      </p>
      <TokenForm
        availableScopes={loginInfo.config.scopes.filter((scope) =>
          loginInfo.scopes.includes(scope.name)
        )}
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
      router: {
        pathname: '/settings/tokens/new',
        query: {},
      },
    },
  },
};

export const WithNamePrefilled = {
  parameters: {
    nextjs: {
      router: {
        pathname: '/settings/tokens/new',
        query: {
          name: 'My API Token',
        },
      },
    },
  },
};

export const WithSingleScope = {
  parameters: {
    nextjs: {
      router: {
        pathname: '/settings/tokens/new',
        query: {
          scope: 'read:all',
        },
      },
    },
  },
};

export const WithCommaDelimitedScopes = {
  parameters: {
    nextjs: {
      router: {
        pathname: '/settings/tokens/new',
        query: {
          scope: 'read:all,user:token',
        },
      },
    },
  },
};

export const WithRepeatedScopeParameters = {
  parameters: {
    nextjs: {
      router: {
        pathname: '/settings/tokens/new',
        query: {
          scope: ['read:all', 'user:token', 'exec:notebook'],
        },
      },
    },
  },
};

export const WithMixedScopeFormats = {
  parameters: {
    nextjs: {
      router: {
        pathname: '/settings/tokens/new',
        query: {
          scope: ['read:all,user:token', 'exec:notebook'],
        },
      },
    },
  },
};

export const WithExpirationPrefilled = {
  parameters: {
    nextjs: {
      router: {
        pathname: '/settings/tokens/new',
        query: {
          expiration: '30d',
        },
      },
    },
  },
};

export const WithAllParametersCombined = {
  parameters: {
    nextjs: {
      router: {
        pathname: '/settings/tokens/new',
        query: {
          name: 'Complete Token',
          scope: ['read:all', 'user:token'],
          expiration: '7d',
        },
      },
    },
  },
};

export const WithInvalidParameters = {
  parameters: {
    nextjs: {
      router: {
        pathname: '/settings/tokens/new',
        query: {
          name: 'Valid Name',
          scope: 'read:all',
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
      router: {
        pathname: '/settings/tokens/new',
        query: {
          scope: 'read:all,,user:token',
        },
      },
    },
  },
};

export const WithWhitespaceInScopes = {
  parameters: {
    nextjs: {
      router: {
        pathname: '/settings/tokens/new',
        query: {
          scope: ' read:all , user:token ',
        },
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
      router: {
        pathname: '/settings/tokens/new',
        query: {},
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
      router: {
        pathname: '/settings/tokens/new',
        query: {},
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
  const urlString =
    typeof url === 'string'
      ? url
      : url instanceof URL
        ? url.toString()
        : url.url;

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
  useEffect(() => {
    // biome-ignore lint/suspicious/noExplicitAny: Mock fetch needs to match global fetch type
    window.fetch = mockFetchWithLimitedScopes as any;
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
      router: {
        pathname: '/settings/tokens/new',
        query: {},
      },
    },
  },
};
