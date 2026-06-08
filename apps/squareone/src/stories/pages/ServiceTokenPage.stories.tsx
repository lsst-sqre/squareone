import type { TokenInfo } from '@lsst-sqre/gafaelfawr-client';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { getRouter } from '@storybook/nextjs-vite/navigation.mock';
import { useEffect } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import ServiceTokenPageClient from '../../app/admin/service-tokens/ServiceTokenPageClient';
import { useStaticConfig } from '../../hooks/useStaticConfig';

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

// Reads config at mount so the single config-promise suspend (`use()` in
// useStaticConfig) happens once, up front, before any interaction. In the real
// app the admin layout/nav consume config at startup, so it is always resolved
// by the time a user interacts; the landing page itself reads no config. This
// keeps the isolated story faithful: without it, AccessTokensView is the first
// config consumer and its mount-time suspend would unwind to the page-level
// Suspense boundary, unmounting the manage section and resetting its looked-up
// username before the token list can render.
function ConfigWarmer({ children }: { children: React.ReactNode }) {
  useStaticConfig();
  return <>{children}</>;
}

const meta: Meta<typeof ServiceTokenPageClient> = {
  title: 'Pages/Admin/ServiceTokenPage',
  component: ServiceTokenPageClient,
  decorators: [
    // biome-ignore lint/suspicious/noExplicitAny: Storybook decorator accepts any Story component
    (Story: any) => (
      <MockFetchProvider>
        <ConfigWarmer>
          <Story />
        </ConfigWarmer>
      </MockFetchProvider>
    ),
  ],
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/admin/service-tokens',
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
    // The intro steers admins to a GafaelfawrServiceToken resource for in-cluster
    // services via an external docs link.
    await expect(
      canvas.getByRole('link', { name: 'GafaelfawrServiceToken resource' })
    ).toHaveAttribute(
      'href',
      'https://gafaelfawr.lsst.io/user-guide/service-tokens.html'
    );
    // The landing page links to the creation flow rather than embedding the
    // form (which now lives on /admin/service-tokens/new).
    await expect(
      canvas.getByRole('link', { name: 'Create a service token' })
    ).toBeInTheDocument();
    // No creation form is rendered on the landing page.
    await expect(canvas.queryByLabelText(/bot username/i)).toBeNull();
    await expect(
      canvas.getByRole('heading', { name: /manage existing tokens/i })
    ).toBeInTheDocument();
  },
};

// The landing's lookup box is a quick entry point that hands off to the
// dedicated `/search` page; the token list itself lives there. Entering a bot
// username and submitting navigates to `/admin/service-tokens/search?q=<bot>`
// rather than listing tokens inline.
export const ManageTokens: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const lookupField = await canvas.findByLabelText('Bot user');
    await userEvent.type(lookupField, 'bot-ci');
    await userEvent.click(
      canvas.getByRole('button', { name: /look up tokens/i })
    );

    await expect(getRouter().push).toHaveBeenCalledWith(
      '/admin/service-tokens/search?q=bot-ci'
    );
  },
};
