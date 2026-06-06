import type { TokenInfo } from '@lsst-sqre/gafaelfawr-client';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useEffect } from 'react';
import { expect, userEvent, within } from 'storybook/test';
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

// Service tokens returned for the manage-existing-tokens lookup. Tokens are the
// required 22 characters so they pass the gafaelfawr-client schema.
const now = Math.floor(Date.now() / 1000);
const mockServiceTokens: TokenInfo[] = [
  {
    username: 'bot-ci',
    token_type: 'service',
    service: null,
    scopes: ['read:tap', 'read:image'],
    token: '4dE8wPjqh1MY0zsD8svAHQ',
    token_name: 'ci-pipeline',
    created: now - 86400,
    expires: null,
    parent: null,
  },
  {
    username: 'bot-ci',
    token_type: 'service',
    service: null,
    scopes: ['exec:notebook'],
    token: 'xK9mNpLq2RsT3uVwXyZaBc',
    token_name: 'nightly-build',
    created: now - 86400 * 7,
    expires: now + 86400 * 30,
    parent: null,
  },
];

const originalFetch = typeof window !== 'undefined' ? window.fetch : fetch;

const mockFetch = (async (url: string | URL | Request, init?: RequestInit) => {
  const urlString =
    typeof url === 'string'
      ? url
      : url instanceof URL
        ? url.toString()
        : url.url;
  const method = (init?.method ?? 'GET').toUpperCase();

  if (urlString.includes('/auth/api/v1/login')) {
    return {
      ok: true,
      status: 200,
      json: async () => mockLoginInfo,
    } as Response;
  }

  // Per-user token routes: GET lists a bot user's tokens, DELETE revokes one.
  if (urlString.includes('/users/') && urlString.includes('/tokens')) {
    if (method === 'DELETE') {
      return { ok: true, status: 204, json: async () => ({}) } as Response;
    }
    return {
      ok: true,
      status: 200,
      json: async () => mockServiceTokens,
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

// Exercises the manage-existing-tokens lookup: enter a bot username and list
// that user's service tokens, each with a Delete (revoke) control.
export const ManageTokens: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const lookupField = await canvas.findByLabelText('Bot user');
    await userEvent.type(lookupField, 'bot-ci');
    await userEvent.click(
      canvas.getByRole('button', { name: /look up tokens/i })
    );

    // The looked-up bot user's service tokens are listed.
    await expect(await canvas.findByText('ci-pipeline')).toBeInTheDocument();
    await expect(canvas.getByText('nightly-build')).toBeInTheDocument();
    // Each listed token offers a revoke control.
    await expect(
      canvas.getAllByRole('button', { name: /delete/i }).length
    ).toBeGreaterThan(0);
  },
};
