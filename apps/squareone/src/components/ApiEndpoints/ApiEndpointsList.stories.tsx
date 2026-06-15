import { mockDiscovery } from '@lsst-sqre/repertoire-client';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { serviceDiscoveryToApiEndpointGroups } from '../../lib/apiEndpoints/transform';
import ApiEndpointsList from './ApiEndpointsList';

// Drive the story from the same transform the page uses, applied to the
// refreshed Repertoire 2.0.0 mock, so the story exercises the real
// discovery -> display shape (one group per dataset, every service listed).
const discoveryGroups = serviceDiscoveryToApiEndpointGroups(mockDiscovery);

const meta: Meta<typeof ApiEndpointsList> = {
  title: 'Components/ApiEndpointsList',
  component: ApiEndpointsList,
};

export default meta;
type Story = StoryObj<typeof ApiEndpointsList>;

// Rendered from mock discovery: one section per dataset, with every service
// (including the unmapped datalink/gms) listed by its raw name and base URL.
export const FromMockDiscovery: Story = {
  args: { groups: discoveryGroups },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('heading', { name: 'dp1' })
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('heading', { name: 'dp02' })
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('heading', { name: 'dp03' })
    ).toBeInTheDocument();

    // Unmapped service falls back to raw name + base URL link. The datalink
    // base URL is shared across datasets, so more than one link matches.
    const datalinkLinks = canvas.getAllByRole('link', {
      name: 'https://data.lsst.cloud/api/datalink',
    });
    await expect(datalinkLinks.length).toBeGreaterThan(0);
    await expect(datalinkLinks[0]).toHaveAttribute(
      'href',
      'https://data.lsst.cloud/api/datalink'
    );
  },
};

// With no groups the component renders nothing (the page omits the section
// entirely in this state).
export const Empty: Story = {
  args: { groups: [] },
};
