import { mockOidcClients } from '@lsst-sqre/gafaelfawr-client';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import OIDCClientsTable from './OIDCClientsTable';

const meta: Meta<typeof OIDCClientsTable> = {
  title: 'Components/OIDCClientsTable',
  component: OIDCClientsTable,
  parameters: {
    layout: 'padded',
  },
  // Run these stories as interaction tests in the `storybook` vitest project.
  tags: ['test'],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The loaded listing: each client a primary row of description and
 * last-modified metadata over a full-width row carrying its identifiers.
 */
export const Loaded: Story = {
  args: {
    clients: mockOidcClients,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Every fixture is listed, with its opaque identifying columns.
    await expect(canvas.getByText('Chronograf dashboards')).toBeInTheDocument();
    await expect(canvas.getByText('Argo CD')).toBeInTheDocument();
    await expect(
      canvas.getByText('https://argocd.example.org/auth/callback')
    ).toBeInTheDocument();

    // The description carries the link to the per-client detail route.
    await expect(
      canvas.getByRole('link', { name: 'Chronograf dashboards' })
    ).toHaveAttribute(
      'href',
      `/admin/oidc-clients/${mockOidcClients[0].client_id}`
    );

    // Timestamps render in the app's stable UTC form, not the viewer's zone.
    await expect(canvas.getByText('2026-03-02 16:45 UTC')).toBeInTheDocument();

    await expect(
      canvas.getByRole('link', { name: /new client/i })
    ).toHaveAttribute('href', '/admin/oidc-clients/new');
  },
};

/**
 * Sorting reorders the loaded rows on the client. Gafaelfawr returns the whole
 * collection in one response, so this is a complete sort rather than a
 * per-page one.
 */
export const SortedByDescription: Story = {
  name: 'Sorted by description',
  args: {
    clients: mockOidcClients,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: /description/i }));

    const rows = canvas.getAllByRole('row').slice(1);
    await expect(within(rows[0]).getByText('Argo CD')).toBeInTheDocument();
  },
};

/**
 * The empty state, for an environment whose OpenID Connect server is running
 * but has no clients registered yet. The "New client" button stays: registering
 * the first client is the whole point of the page.
 */
export const Empty: Story = {
  args: {
    clients: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText(/no openid connect clients are registered/i)
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('link', { name: /new client/i })
    ).toBeInTheDocument();
  },
};

/**
 * The loaded listing in dark mode, so the table's adaptive
 * `--rsd-component-*` tokens stay verifiable there too.
 */
export const Dark: Story = {
  args: {
    clients: mockOidcClients,
  },
  globals: {
    theme: 'dark',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Chronograf dashboards')).toBeInTheDocument();
  },
};
