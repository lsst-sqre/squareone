import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useEffect } from 'react';
import { expect, within } from 'storybook/test';
import NewServiceTokenPageClient from '../../app/admin/service-tokens/new/NewServiceTokenPageClient';

// Mock login info exposing a full configured scope list that is a superset of
// the signed-in admin's own scopes, so the form demonstrates offering every
// configured scope.
const mockLoginInfo = {
  csrf: 'mock-csrf-token',
  username: 'admin',
  scopes: ['exec:admin', 'admin:token'],
  config: {
    scopes: [
      { name: 'read:tap', description: 'Read access to the TAP service' },
      { name: 'read:image', description: 'Read access to images' },
      { name: 'exec:notebook', description: 'Can execute notebooks' },
      { name: 'exec:portal', description: 'Can access the science portal' },
      { name: 'admin:token', description: 'Can create and manage all tokens' },
    ],
  },
};

// An admin without the `admin:token` scope: the page shows the explanatory
// banner and disables the form rather than letting a submit fail with a 403.
const mockLoginInfoNoAdminToken = {
  ...mockLoginInfo,
  scopes: ['exec:admin'],
};

const originalFetch = typeof window !== 'undefined' ? window.fetch : fetch;

function makeMockFetch(loginInfo: typeof mockLoginInfo) {
  return (async (url: string | URL | Request) => {
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
        json: async () => loginInfo,
      } as Response;
    }

    // The admin creation endpoint (POST {base}/tokens).
    if (urlString.includes('/tokens')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({ token: 'gt-service-token-secret-1234567890' }),
      } as Response;
    }

    return originalFetch(url);
    // biome-ignore lint/suspicious/noExplicitAny: Mock fetch needs to match the global fetch type
  }) as any;
}

// Install the fetch mock during render (top-down, before the login query's
// child effect fires) and restore it on unmount.
function MockFetchProvider({
  children,
  loginInfo = mockLoginInfo,
}: {
  children: React.ReactNode;
  loginInfo?: typeof mockLoginInfo;
}) {
  window.fetch = makeMockFetch(loginInfo);
  useEffect(() => {
    return () => {
      window.fetch = originalFetch;
    };
  }, []);
  return <>{children}</>;
}

const meta: Meta<typeof NewServiceTokenPageClient> = {
  title: 'Pages/Admin/NewServiceTokenPage',
  component: NewServiceTokenPageClient,
  decorators: [
    // biome-ignore lint/suspicious/noExplicitAny: Storybook decorator accepts any Story component
    (Story: any) => (
      <MockFetchProvider>
        <Story />
      </MockFetchProvider>
    ),
  ],
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/admin/service-tokens/new',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof NewServiceTokenPageClient>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByRole('heading', {
        level: 1,
        name: 'Create a service token',
      })
    ).toBeInTheDocument();
    // The creation form appears once login info resolves.
    await expect(
      await canvas.findByLabelText(/bot username/i)
    ).toBeInTheDocument();
    // A scope the admin doesn't personally hold is still offered.
    await expect(canvas.getByLabelText(/read:tap/i)).toBeInTheDocument();
    // The form offers a Cancel control alongside submit.
    await expect(
      canvas.getByRole('button', { name: /cancel/i })
    ).toBeInTheDocument();
  },
};

// An admin without `admin:token` sees the explanatory banner and a disabled
// form rather than a silent 403 on submit.
export const MissingAdminTokenScope: Story = {
  decorators: [
    // biome-ignore lint/suspicious/noExplicitAny: Storybook decorator accepts any Story component
    (Story: any) => (
      <MockFetchProvider loginInfo={mockLoginInfoNoAdminToken}>
        <Story />
      </MockFetchProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByText(/required to create service tokens/i)
    ).toBeInTheDocument();
    await expect(canvas.getByLabelText(/bot username/i)).toBeDisabled();
    await expect(
      canvas.getByRole('button', { name: /create service token/i })
    ).toBeDisabled();
  },
};
