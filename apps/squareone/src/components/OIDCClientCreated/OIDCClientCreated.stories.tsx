import type { OIDCClientWithSecret } from '@lsst-sqre/gafaelfawr-client';
import { mockOidcClients } from '@lsst-sqre/gafaelfawr-client';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import OIDCClientCreated from './OIDCClientCreated';

/**
 * A freshly-registered client, built from the shared listing fixture so the
 * success view and the table tell the same story about the same deployment.
 */
const createdClient: OIDCClientWithSecret = {
  ...mockOidcClients[0],
  client_secret: 'dev-oidc-secret-0001-xxxxxxxxxxxxxxxxxxxxxxxx',
};

const meta: Meta<typeof OIDCClientCreated> = {
  title: 'Components/OIDCClientCreated',
  component: OIDCClientCreated,
  parameters: {
    layout: 'padded',
  },
  args: {
    client: createdClient,
  },
  // Run these stories as interaction tests in the `storybook` vitest project.
  tags: ['test'],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The one-shot confirmation that replaces the create form. Both credentials are
 * copyable, and the warning is emphatic because Gafaelfawr discloses the secret
 * only with the 201 and offers no way to rotate it.
 */
export const Created: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText(createdClient.client_id)).toBeInTheDocument();
    await expect(
      canvas.getByText(createdClient.client_secret)
    ).toBeInTheDocument();
    await expect(
      canvas.getByText(/only time gafaelfawr will show it/i)
    ).toBeInTheDocument();

    await expect(
      canvas.getByRole('button', { name: /copy client secret to clipboard/i })
    ).toBeEnabled();
    await expect(
      canvas.getByRole('link', { name: /view this client/i })
    ).toHaveAttribute('href', `/admin/oidc-clients/${createdClient.client_id}`);
    await expect(
      canvas.getByRole('link', { name: /back to all clients/i })
    ).toHaveAttribute('href', '/admin/oidc-clients');
  },
};

/**
 * The same view under the dark theme, where the secret's emphasized panel
 * swaps to its dark surface token.
 */
export const Dark: Story = {
  globals: {
    theme: 'dark',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText(createdClient.client_secret)
    ).toBeInTheDocument();
  },
};
