import { mockDiscovery } from '@lsst-sqre/repertoire-client';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { serviceDiscoveryToApiEndpointGroups } from '../../lib/apiEndpoints/transform';
import ApiEndpointsList from './ApiEndpointsList';

// Drive the story from the same transform the page uses, applied to the
// refreshed Repertoire 2.0.0 mock, so the story exercises the real
// discovery -> display shape with the curated presentation map.
const discoveryGroups = serviceDiscoveryToApiEndpointGroups(mockDiscovery);

const meta: Meta<typeof ApiEndpointsList> = {
  title: 'Components/ApiEndpointsList',
  component: ApiEndpointsList,
};

export default meta;
type Story = StoryObj<typeof ApiEndpointsList>;

// Rendered from mock discovery: one section per dataset with curated labels,
// IVOA standard links, and selected URLs matching the production idfprod page.
// Curated services without an IVOA standard (DataLink, GMS) render a plain-text
// label; a service absent from the map would fall back to its raw name.
export const FromMockDiscovery: Story = {
  args: { groups: discoveryGroups },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Dataset display names render as section headings (linked to their docs).
    await expect(
      canvas.getByRole('heading', { name: 'Data Preview 1' })
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('heading', { name: 'Data Preview 0.2' })
    ).toBeInTheDocument();

    // Curated SIA label links to the IVOA SIA standard, and the dp1 SIA
    // endpoint surfaces the sia-query-2.0 /query URL (matching idfprod).
    const siaLabels = canvas.getAllByRole('link', {
      name: 'Simple Image Access (SIA v2)',
    });
    await expect(siaLabels[0]).toHaveAttribute(
      'href',
      'https://www.ivoa.net/documents/SIA/'
    );
    await expect(
      canvas.getByRole('link', {
        name: 'https://data.lsst.cloud/api/sia/dp1/query',
      })
    ).toBeInTheDocument();

    // HiPS surfaces the /list URL.
    await expect(
      canvas.getByRole('link', {
        name: 'https://data.lsst.cloud/api/hips/v2/dp1/list',
      })
    ).toBeInTheDocument();

    // ObsTAP (the generic TAP label) uses the base URL.
    await expect(
      canvas.getAllByRole('link', {
        name: 'Table Access Protocol (TAP)',
      })[0]
    ).toHaveAttribute('href', 'https://www.ivoa.net/documents/TAP/');

    // A curated service without an IVOA standard (DataLink) renders its label
    // as plain text alongside its base URL link.
    await expect(canvas.getAllByText('DataLink')[0]).toBeInTheDocument();
    const datalinkLinks = canvas.getAllByRole('link', {
      name: 'https://data.lsst.cloud/api/datalink',
    });
    await expect(datalinkLinks.length).toBeGreaterThan(0);
  },
};

// With no groups the component renders nothing (the page omits the section
// entirely in this state).
export const Empty: Story = {
  args: { groups: [] },
};
