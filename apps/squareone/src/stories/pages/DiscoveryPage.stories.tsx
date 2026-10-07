import {
  discoveryQueryOptions,
  getEmptyDiscovery,
  mockDiscoveryDataDev,
  type ServiceDiscovery,
} from '@lsst-sqre/repertoire-client';
import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import DiscoveryPageClient from '../../app/admin/discovery/DiscoveryPageClient';
import { ConfigProvider } from '../../contexts/rsc';
import { useStaticConfig } from '../../hooks/useStaticConfig';
import { holdCrossOriginFetch } from '../support/fetchStub';

/** The data-dev Repertoire URL, which `mockDiscoveryDataDev` comes from. */
const REPERTOIRE_URL = 'https://data-dev.lsst.cloud/repertoire';

/**
 * Enables service discovery (by adding `repertoireUrl` to the Storybook
 * config) and, given a document, seeds a fresh query cache with it, so the
 * page renders that document on its first pass. Without a document the
 * discovery query starts fetching, and `holdCrossOriginFetch` (the stories'
 * `beforeEach`) keeps it pending.
 */
function DiscoveryProvider({
  discovery,
  children,
}: {
  discovery?: ServiceDiscovery;
  children: ReactNode;
}) {
  // Extend the Storybook-wide config rather than restating it.
  const config = useStaticConfig();
  const [configPromise] = useState(() =>
    Promise.resolve({ ...config, repertoireUrl: REPERTOIRE_URL })
  );
  const [queryClient] = useState(() => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    if (discovery) {
      client.setQueryData(
        discoveryQueryOptions(REPERTOIRE_URL).queryKey,
        discovery
      );
    }
    return client;
  });

  return (
    <ConfigProvider configPromise={configPromise}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ConfigProvider>
  );
}

/** Render the story with service discovery configured, holding `discovery`. */
function withDiscovery(discovery?: ServiceDiscovery): Decorator {
  return function DiscoveryDecorator(Story) {
    return (
      <DiscoveryProvider discovery={discovery}>
        <Story />
      </DiscoveryProvider>
    );
  };
}

const meta: Meta<typeof DiscoveryPageClient> = {
  title: 'Pages/Admin/DiscoveryPage',
  component: DiscoveryPageClient,
  parameters: {
    layout: 'padded',
  },
  // Keep the discovery query (and any refetch) off the live data-dev
  // Repertoire: a held request never settles.
  beforeEach: holdCrossOriginFetch,
  // Run these stories as interaction tests in the `storybook` vitest project.
  tags: ['test'],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The live data-dev (idfdev) Repertoire 3.0.0 discovery document, rendered as
 * pretty-printed JSON with line numbers and a copy button, under a link to
 * the document's URL and a note that Squareone caches it.
 */
export const DataDev: Story = {
  decorators: [withDiscovery(mockDiscoveryDataDev)],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByRole('heading', {
        level: 1,
        name: 'Service discovery',
      })
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('link', {
        name: 'https://data-dev.lsst.cloud/repertoire/discovery',
      })
    ).toHaveAttribute(
      'href',
      'https://data-dev.lsst.cloud/repertoire/discovery'
    );
    await expect(
      canvas.getByText(/caches service discovery for 5 minutes/)
    ).toBeInTheDocument();

    const block = canvas.getByRole('group', {
      name: 'Service discovery JSON',
    });
    await expect(block.querySelector('code')?.textContent).toBe(
      JSON.stringify(mockDiscoveryDataDev, null, 2)
    );
    await expect(
      within(block).getByRole('button', { name: 'Copy code to clipboard' })
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: 'Refetch' })
    ).not.toBeDisabled();
  },
};

/**
 * Refetching: the Refetch button is disabled (with a spinner) while the
 * request is in flight, and the current document stays on screen.
 */
export const Refetching: Story = {
  decorators: [withDiscovery(mockDiscoveryDataDev)],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Refetch' })
    );

    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Refetch' })).toBeDisabled()
    );
    await expect(
      canvas.getByRole('group', { name: 'Service discovery JSON' })
    ).toBeInTheDocument();
  },
};

/** Discovery is configured but has not loaded yet. */
export const Loading: Story = {
  decorators: [withDiscovery()],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByText(/loading service discovery/i)
    ).toBeInTheDocument();
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
  },
};

/**
 * Discovery could not be loaded. A failed fetch resolves to the empty
 * discovery document, so the page warns, with a button to try again.
 */
export const Unavailable: Story = {
  decorators: [withDiscovery(getEmptyDiscovery())],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByText(/could not load service discovery/i)
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: 'Retry' })
    ).toBeInTheDocument();
    await expect(
      canvas.queryByRole('group', { name: 'Service discovery JSON' })
    ).not.toBeInTheDocument();
  },
};

/**
 * No `repertoireUrl` is configured (as in the Storybook-wide config), so
 * there is no document to show.
 */
export const NotConfigured: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByText(
        /service discovery is not configured for this environment/i
      )
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('heading', { level: 1, name: 'Service discovery' })
    ).toBeInTheDocument();
  },
};
