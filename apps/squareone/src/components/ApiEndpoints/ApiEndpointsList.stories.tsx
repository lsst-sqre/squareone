import {
  getEmptyDiscovery,
  mockDiscovery,
  type ServiceDiscovery,
} from '@lsst-sqre/repertoire-client';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { serviceDiscoveryToApiEndpointGroups } from '../../lib/apiEndpoints/transform';
import ApiEndpointsList from './ApiEndpointsList';

// Drive the story from the same transform the page uses, applied to the
// Repertoire 3.0.0 mock, so the story exercises the real
// discovery -> display shape with the curated presentation map.
const discoveryGroups = serviceDiscoveryToApiEndpointGroups(mockDiscovery);

// Services whose presentation comes from discovery rather than curation. The
// dp1 services are absent from the curated presentation map: one with a
// Repertoire 3.0 title and non-IVOA docs URL, one whose docs URL is an IVOA
// standard and whose only version carries its query URL, and one with neither
// (as Repertoire 2.x publishes). The prompt alerts service is shaped like
// Repertoire 2.x too; its map entry supplies only the label for an untitled
// alerts service.
const unmappedGroups = serviceDiscoveryToApiEndpointGroups({
  ...getEmptyDiscovery(),
  datasets: {
    dp1: {
      description: 'Services without curated presentation.',
      services: {
        spectra: {
          url: 'https://data.lsst.cloud/api/spectra',
          title: 'Spectrum retrieval',
          docs_url: 'https://spectra.lsst.io/',
          required_scopes: [],
          quota_labels: {},
          versions: {},
        },
        ssa: {
          url: 'https://data.lsst.cloud/api/ssa',
          title: 'Simple spectral access (SSA)',
          docs_url: 'https://www.ivoa.net/documents/SSA/',
          required_scopes: [],
          quota_labels: {},
          versions: {
            'ssa-1.1': { url: 'https://data.lsst.cloud/api/ssa/query' },
          },
        },
        mystery: {
          url: 'https://data.lsst.cloud/api/mystery',
          required_scopes: [],
          quota_labels: {},
          versions: {},
        },
      },
    },
    prompt: {
      services: {
        alerts: {
          url: 'https://data.lsst.cloud/api/alerts',
          required_scopes: [],
          quota_labels: {},
          versions: {},
        },
      },
    },
  },
} as ServiceDiscovery);

// A Data Preview 1 section holding only the given mock-discovery services, so
// a story can show endpoints with and without required scopes in isolation.
function dp1GroupsWith(...serviceNames: string[]) {
  const dp1 = mockDiscovery.datasets.dp1;
  return serviceDiscoveryToApiEndpointGroups({
    ...getEmptyDiscovery(),
    datasets: {
      dp1: {
        ...dp1,
        services: Object.fromEntries(
          serviceNames.map((name) => [name, dp1.services[name]])
        ),
      },
    },
  });
}

/** The list item rendering the endpoint with the given label. */
function getEndpointItem(container: HTMLElement, label: string): HTMLElement {
  const item = within(container).getByText(label).closest('li');
  if (!item) {
    throw new Error(`No list item for endpoint ${label}`);
  }
  return item;
}

/** The scope pills an endpoint shows, or `[]` when it lists none. */
function getScopePills(item: HTMLElement): (string | null)[] {
  const list = within(item).queryByRole('list', { name: 'Required scopes' });
  return list
    ? within(list)
        .getAllByRole('listitem')
        .map((pill) => pill.textContent)
    : [];
}

const meta: Meta<typeof ApiEndpointsList> = {
  title: 'Components/ApiEndpointsList',
  component: ApiEndpointsList,
};

export default meta;
type Story = StoryObj<typeof ApiEndpointsList>;

// Rendered from mock discovery: one section per dataset with curated labels,
// IVOA standard links, and selected URLs matching the production idfprod page.
// Every curated RSP service maps to an IVOA standard, so each name shows a
// book-icon link named for its standard (e.g. "IVOA TAP docs"). The alerts
// service under Prompt Products, which the map names only when discovery has
// no title, takes its discovery title and technote docs link ("Alert
// retrieval docs").
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

    // The alerts service (Prompt Products) is labelled by its discovery title,
    // with a book-icon link to its non-IVOA docs.
    await expect(canvas.getByText('Alert retrieval')).toBeInTheDocument();
    await expect(
      canvas.getByRole('link', { name: 'Alert retrieval docs' })
    ).toHaveAttribute('href', 'https://sqr-114.lsst.io/');

    // Each endpoint exposes an icon-only copy-to-clipboard button.
    const copyButtons = canvas.getAllByRole('button', {
      name: /copy the .* endpoint url/i,
    });
    await expect(copyButtons.length).toBeGreaterThan(0);

    // Endpoints show their discovery required scopes as pills: TAP needs
    // read:tap, the image services read:image, and GMS declares none.
    const dp1Section = canvas
      .getByRole('heading', { name: 'Data Preview 1' })
      .closest('section') as HTMLElement;
    const pillsFor = (label: string) =>
      getScopePills(getEndpointItem(dp1Section, label));
    await expect(pillsFor('Table Access Protocol (TAP)')).toEqual(['read:tap']);
    await expect(pillsFor('Simple Image Access (SIA v2)')).toEqual([
      'read:image',
    ]);
    await expect(pillsFor('SODA Image Cutouts')).toEqual(['read:image']);
    await expect(pillsFor('HiPS (Hierarchical Progressive Survey)')).toEqual([
      'read:image',
    ]);
    await expect(pillsFor('Group Membership Service (GMS)')).toEqual([]);
    await expect(
      within(
        getEndpointItem(dp1Section, 'Group Membership Service (GMS)')
      ).queryByRole('link', { name: /create a token/i })
    ).not.toBeInTheDocument();
  },
};

// An endpoint whose service requires scopes lists them as pills under its URL,
// with a link to the token creation form prefilled with those scopes.
export const EndpointWithRequiredScopes: Story = {
  args: { groups: dp1GroupsWith('tap') },
  play: async ({ canvasElement }) => {
    const item = getEndpointItem(canvasElement, 'Table Access Protocol (TAP)');

    await expect(getScopePills(item)).toEqual(['read:tap']);
    await expect(
      within(item).getByRole('link', {
        name: 'Create a token with these scopes for Table Access Protocol (TAP)',
      })
    ).toHaveAttribute('href', '/settings/tokens/new?scopes=read%3Atap');
  },
};

// An endpoint whose service declares no required scopes (as GMS does, and as
// every service does under Repertoire 2.x) shows no pills and no token link.
export const EndpointWithoutRequiredScopes: Story = {
  args: { groups: dp1GroupsWith('gms') },
  play: async ({ canvasElement }) => {
    const item = getEndpointItem(
      canvasElement,
      'Group Membership Service (GMS)'
    );

    await expect(getScopePills(item)).toEqual([]);
    await expect(
      within(item).queryByRole('link', { name: /create a token/i })
    ).not.toBeInTheDocument();
  },
};

// Services absent from the curated presentation map fall back to discovery
// metadata: the title labels the endpoint and the docs URL becomes a book-icon
// link — named for the IVOA standard when it is one, otherwise a generic docs
// link. A service with exactly one version (SSA) surfaces that version's URL;
// the others, with no versions, surface their base URL. A service with neither
// title nor docs URL (Repertoire 2.x) shows its raw name, unlinked, except
// alerts, which the map labels "Alerts" when discovery has no title.
export const UnmappedServiceFallbacks: Story = {
  args: { groups: unmappedGroups },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Spectrum retrieval')).toBeInTheDocument();
    await expect(
      canvas.getByRole('link', { name: 'Spectrum retrieval docs' })
    ).toHaveAttribute('href', 'https://spectra.lsst.io/');

    await expect(
      canvas.getByText('Simple spectral access (SSA)')
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('link', { name: 'IVOA SSA docs' })
    ).toHaveAttribute('href', 'https://www.ivoa.net/documents/SSA/');
    // SSA's only version supplies its query URL in place of the base URL.
    await expect(
      canvas.getByText('https://data.lsst.cloud/api/ssa/query')
    ).toBeInTheDocument();
    await expect(
      canvas.queryByText('https://data.lsst.cloud/api/ssa')
    ).not.toBeInTheDocument();

    await expect(canvas.getByText('mystery')).toBeInTheDocument();
    await expect(
      canvas.queryByRole('link', { name: /mystery/i })
    ).not.toBeInTheDocument();

    await expect(canvas.getByText('Alerts')).toBeInTheDocument();
    await expect(
      canvas.queryByRole('link', { name: /alert/i })
    ).not.toBeInTheDocument();
  },
};

// With no groups the component renders nothing (the page omits the section
// entirely in this state).
export const Empty: Story = {
  args: { groups: [] },
};
