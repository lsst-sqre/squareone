/**
 * A story decorator that renders a component against `mockDiscovery` as a
 * given visitor: anonymous, or signed in with a chosen set of scopes.
 *
 * The decorator enables service discovery (by adding a `repertoireUrl` to the
 * Storybook config) and seeds a fresh query cache with the discovery document,
 * the visitor's Gafaelfawr login info (the scopes that gate services declaring
 * `required_scopes`), and their user info. Seeding rather than stubbing `fetch`
 * keeps the stories deterministic: the components render the final state on
 * their first pass, with no loading states for a play function to wait out.
 *
 * `mockDiscovery` points at the live RSP, so pair the decorator with
 * `holdCrossOriginFetch` as the story's `beforeEach`, which keeps any query the
 * cache does not answer from reaching it.
 *
 * Story-support only: nothing in the app bundle imports this module.
 */

import {
  type LoginInfo,
  loginInfoQueryOptions,
  mockLoginInfo,
  mockUnauthenticatedUserInfo,
  mockUserInfo,
  userInfoQueryOptions,
} from '@lsst-sqre/gafaelfawr-client';
import {
  discoveryQueryOptions,
  mockDiscovery,
} from '@lsst-sqre/repertoire-client';
import type { Decorator } from '@storybook/nextjs-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';

import { ConfigProvider } from '../../contexts/rsc';
import { useStaticConfig } from '../../hooks/useStaticConfig';

/** The (never fetched) discovery URL the seeded stories are configured with. */
export const STORY_REPERTOIRE_URL = 'https://data.lsst.cloud/repertoire';

/**
 * Who is viewing: `null` for an anonymous visitor (Gafaelfawr answers 401, so
 * there is no login info), otherwise the signed-in user's scopes.
 */
export type StoryVisitor = { scopes: string[] } | null;

function loginInfoFor(visitor: StoryVisitor): LoginInfo | null {
  return visitor ? { ...mockLoginInfo, scopes: visitor.scopes } : null;
}

function ServiceAccessProvider({
  visitor,
  children,
}: {
  visitor: StoryVisitor;
  children: ReactNode;
}) {
  // Extend the Storybook-wide config rather than restating it.
  const config = useStaticConfig();
  const [configPromise] = useState(() =>
    Promise.resolve({ ...config, repertoireUrl: STORY_REPERTOIRE_URL })
  );
  const [queryClient] = useState(() => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    client.setQueryData(
      discoveryQueryOptions(STORY_REPERTOIRE_URL).queryKey,
      mockDiscovery
    );
    client.setQueryData(
      loginInfoQueryOptions().queryKey,
      loginInfoFor(visitor)
    );
    client.setQueryData(
      userInfoQueryOptions().queryKey,
      visitor ? mockUserInfo : mockUnauthenticatedUserInfo
    );
    return client;
  });

  return (
    <ConfigProvider configPromise={configPromise}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ConfigProvider>
  );
}

/** Render the story against `mockDiscovery` as `visitor`. */
export function withServiceAccess(visitor: StoryVisitor): Decorator {
  return function ServiceAccessDecorator(Story) {
    return (
      <ServiceAccessProvider visitor={visitor}>
        <Story />
      </ServiceAccessProvider>
    );
  };
}
