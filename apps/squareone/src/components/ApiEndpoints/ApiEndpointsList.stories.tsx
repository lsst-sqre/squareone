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
// Every curated RSP service maps to an IVOA standard, so each name shows a
// book-icon "IVOA doc" link; a service absent from the map would fall back to
// its raw name with no link.
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

    // Each dataset surfaces a "Read the documentation" link to its docs site at
    // the end of the description.
    await expect(
      canvas.getByRole('link', {
        name: 'Read the Data Preview 1 documentation',
      })
    ).toHaveAttribute('href', 'https://dp1.lsst.io');

    // Curated SIA name renders as plain text and exposes a book-icon link
    // labeled "IVOA SIA docs" to the IVOA SIA standard, and the dp1 SIA
    // endpoint surfaces the sia-query-2.0 /query URL (matching idfprod) as
    // copyable code text.
    await expect(
      canvas.getAllByText('Simple Image Access (SIA v2)')[0]
    ).toBeInTheDocument();
    await expect(
      canvas.getAllByRole('link', { name: 'IVOA SIA docs' })[0]
    ).toHaveAttribute('href', 'https://www.ivoa.net/documents/SIA/');
    await expect(
      canvas.getByText('https://data.lsst.cloud/api/sia/dp1/query')
    ).toBeInTheDocument();

    // HiPS surfaces the /list URL as code text.
    await expect(
      canvas.getByText('https://data.lsst.cloud/api/hips/v2/dp1/list')
    ).toBeInTheDocument();

    // ObsTAP (the generic TAP label) renders as plain text with a book-icon
    // link labeled "IVOA TAP docs" to the TAP standard.
    await expect(
      canvas.getAllByText('Table Access Protocol (TAP)')[0]
    ).toBeInTheDocument();
    await expect(
      canvas.getAllByRole('link', { name: 'IVOA TAP docs' })[0]
    ).toHaveAttribute('href', 'https://www.ivoa.net/documents/TAP/');

    // DataLink renders its name as plain text alongside its base URL as code
    // text, with a book-icon link labeled "IVOA DataLink docs" to the DataLink
    // standard.
    await expect(canvas.getAllByText('DataLink')[0]).toBeInTheDocument();
    const datalinkUrls = canvas.getAllByText(
      'https://data.lsst.cloud/api/datalink'
    );
    await expect(datalinkUrls.length).toBeGreaterThan(0);
    await expect(
      canvas.getAllByRole('link', { name: 'IVOA DataLink docs' })[0]
    ).toHaveAttribute('href', 'https://www.ivoa.net/documents/DataLink/');

    // Each endpoint exposes an icon-only copy-to-clipboard button.
    const copyButtons = canvas.getAllByRole('button', {
      name: /copy the .* endpoint url/i,
    });
    await expect(copyButtons.length).toBeGreaterThan(0);
  },
};

// With no groups the component renders nothing (the page omits the section
// entirely in this state).
export const Empty: Story = {
  args: { groups: [] },
};
