import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useEffect } from 'react';
import { expect, within } from 'storybook/test';
import ServiceTokenPageClient from '../../app/admin/service-token/ServiceTokenPageClient';

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

const originalFetch = typeof window !== 'undefined' ? window.fetch : fetch;

const mockFetch = (async (url: string | URL | Request) => {
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

// Install the fetch mock during render (top-down, before the login query's
// child effect fires) and restore it on unmount.
function MockFetchProvider({ children }: { children: React.ReactNode }) {
  window.fetch = mockFetch;
  useEffect(() => {
    return () => {
      window.fetch = originalFetch;
    };
  }, []);
  return <>{children}</>;
}

const meta: Meta<typeof ServiceTokenPageClient> = {
  title: 'Pages/Admin/ServiceTokenPage',
  component: ServiceTokenPageClient,
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
        pathname: '/admin/service-token',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ServiceTokenPageClient>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByRole('heading', { level: 1, name: 'Service tokens' })
    ).toBeInTheDocument();
    // The creation form appears once login info resolves.
    await expect(
      await canvas.findByLabelText(/bot username/i)
    ).toBeInTheDocument();
    // A scope the admin doesn't personally hold is still offered.
    await expect(canvas.getByLabelText(/read:tap/i)).toBeInTheDocument();
    await expect(
      canvas.getByRole('heading', { name: /manage existing tokens/i })
    ).toBeInTheDocument();
  },
};
