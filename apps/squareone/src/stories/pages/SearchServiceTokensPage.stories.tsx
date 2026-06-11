import type { TokenInfo } from '@lsst-sqre/gafaelfawr-client';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useEffect } from 'react';
import { expect, within } from 'storybook/test';
import SearchServiceTokensPageClient from '../../app/admin/service-tokens/search/SearchServiceTokensPageClient';
import { useStaticConfig } from '../../hooks/useStaticConfig';

// Service tokens returned for the `?q=`-driven lookup. Tokens are the required
// 22 characters so they pass the gafaelfawr-client schema.
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

  // Per-user token routes: GET lists a bot user's tokens, DELETE revokes one.
  // `bot-empty` returns no tokens so the empty-state story can render.
  if (urlString.includes('/users/') && urlString.includes('/tokens')) {
    if (method === 'DELETE') {
      return { ok: true, status: 204, json: async () => ({}) } as Response;
    }
    const tokens = urlString.includes('bot-empty') ? [] : mockServiceTokens;
    return {
      ok: true,
      status: 200,
      json: async () => tokens,
    } as Response;
  }

  return originalFetch(url);
  // biome-ignore lint/suspicious/noExplicitAny: Mock fetch needs to match the global fetch type
}) as any;

// Install the fetch mock during render (top-down, before any token query's
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
// by the time the page renders; here AccessTokensView (via useRepertoireUrl)
// would otherwise be the first config consumer, and its mount-time suspend has
// no boundary in the isolated story.
function ConfigWarmer({ children }: { children: React.ReactNode }) {
  useStaticConfig();
  return <>{children}</>;
}

const meta: Meta<typeof SearchServiceTokensPageClient> = {
  title: 'Pages/Admin/SearchServiceTokensPage',
  component: SearchServiceTokensPageClient,
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
        pathname: '/admin/service-tokens/search',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof SearchServiceTokensPageClient>;

// A valid `?q=` seeds the box and lists that bot user's service tokens; the
// "create a new service token" link carries the bot username through to /new.
export const Default: Story = {
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/admin/service-tokens/search',
        query: { q: 'bot-ci' },
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByRole('heading', {
        level: 1,
        name: 'Look up service tokens',
      })
    ).toBeInTheDocument();
    // The box is seeded from `?q=`.
    await expect(canvas.getByLabelText('Bot user')).toHaveValue('bot-ci');
    // The looked-up bot user's service tokens are listed.
    await expect(await canvas.findByText('ci-pipeline')).toBeInTheDocument();
    await expect(canvas.getByText('nightly-build')).toBeInTheDocument();
    // The create link pre-fills the new-token form with the current bot user.
    await expect(
      canvas.getByRole('link', { name: 'create a new service token' })
    ).toHaveAttribute('href', '/admin/service-tokens/new?username=bot-ci');
  },
};

// No `?q=`: the page prompts for a bot username and issues no request.
export const EmptyQuery: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByText(/enter a bot username/i)
    ).toBeInTheDocument();
    // The create link is bare (no bot user to pre-fill).
    await expect(
      canvas.getByRole('link', { name: 'create a new service token' })
    ).toHaveAttribute('href', '/admin/service-tokens/new');
  },
};

// A non-`bot-` `?q=` shows an inline error and issues no request.
export const InvalidUsername: Story = {
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/admin/service-tokens/search',
        query: { q: 'alice' },
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByText(/must start with "bot-"/i)
    ).toBeInTheDocument();
  },
};

// A valid `?q=` for a bot user with no service tokens shows the empty state.
export const NoTokens: Story = {
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/admin/service-tokens/search',
        query: { q: 'bot-empty' },
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByText(/no service tokens found/i)
    ).toBeInTheDocument();
  },
};
