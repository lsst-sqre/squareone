import {
  getEmptyDiscovery,
  mockDiscovery,
  type ServiceDiscovery,
} from '@lsst-sqre/repertoire-client';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { serviceDiscoveryToDatasetDocs } from '../../lib/datasetDocs/transform';
import DatasetDocsCards from './DatasetDocsCards';

// Drive the stories from the same transform the page uses, so they exercise
// the real discovery -> card shape with the curated dataset display names.
// The Repertoire 3.0.0 mock's prompt dataset has no docs_url, as on data-dev.
const discoveryDatasets = serviceDiscoveryToDatasetDocs(mockDiscovery);

// Every mock dataset that has a docs_url (all but prompt).
const linkedDatasets = discoveryDatasets.filter(
  (dataset) => dataset.docsUrl !== null
);

// Datasets with descriptions but no docs_url (as data-dev publishes the prompt
// dataset), so every card renders unlinked.
const unlinkedDatasets = serviceDiscoveryToDatasetDocs({
  ...getEmptyDiscovery(),
  datasets: {
    dp1: {
      description: mockDiscovery.datasets.dp1.description,
      services: {},
    },
    dp02: {
      description: mockDiscovery.datasets.dp02.description,
      services: {},
    },
  },
} as ServiceDiscovery);

/** The card (article) whose heading names the given dataset. */
function getCard(container: HTMLElement, name: string): HTMLElement {
  const card = within(container)
    .getByRole('heading', { name })
    .closest('article');
  if (!card) {
    throw new Error(`No card for dataset ${name}`);
  }
  return card;
}

const meta: Meta<typeof DatasetDocsCards> = {
  title: 'Components/DatasetDocsCards',
  component: DatasetDocsCards,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs', 'test'],
  // The /docs MDX places its section heading inside the component so the
  // heading is omitted along with the cards.
  args: {
    children: <h2>Data previews</h2>,
  },
};

export default meta;
type Story = StoryObj<typeof DatasetDocsCards>;

// Rendered from mock discovery: one card per dataset, newest release first
// with Prompt Products pinned second. The prompt dataset has no docs_url, so
// its card renders unlinked while the others link to their docs sites.
export const FromMockDiscovery: Story = {
  args: {
    result: { status: 'ok', datasets: discoveryDatasets },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('heading', { level: 2, name: 'Data previews' })
    ).toBeInTheDocument();

    // Display names from the presentation map, in display order.
    await expect(
      canvas
        .getAllByRole('heading', { level: 3 })
        .map((heading) => heading.textContent)
    ).toEqual([
      'Data Preview 1',
      'Prompt Products',
      'Data Preview 0.3',
      'Data Preview 0.2',
    ]);

    // Cards carry the discovery descriptions.
    await expect(
      within(getCard(canvasElement, 'Data Preview 1')).getByText(
        /Data Preview 1 contains image and catalog products/
      )
    ).toBeInTheDocument();

    // A card with a docs_url links to it; the prompt card is unlinked.
    await expect(
      getCard(canvasElement, 'Data Preview 1').closest('a')
    ).toHaveAttribute('href', 'https://dp1.lsst.io');
    await expect(
      getCard(canvasElement, 'Prompt Products').closest('a')
    ).toBeNull();
  },
};

// Every dataset has a docs_url, so every card is a link.
export const WithDocsUrls: Story = {
  args: {
    result: { status: 'ok', datasets: linkedDatasets },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getAllByRole('article')).toHaveLength(3);
    await expect(
      canvas.getAllByRole('link').map((link) => link.getAttribute('href'))
    ).toEqual([
      'https://dp1.lsst.io',
      'https://dp0-3.lsst.io',
      'https://dp0-2.lsst.io',
    ]);
  },
};

// No dataset has a docs_url, so the cards render unlinked.
export const WithoutDocsUrls: Story = {
  args: {
    result: { status: 'ok', datasets: unlinkedDatasets },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getAllByRole('article')).toHaveLength(2);
    await expect(canvas.queryByRole('link')).not.toBeInTheDocument();
  },
};

// Discovery is configured but failed: the section heading and a brief notice.
export const Unavailable: Story = {
  args: {
    result: { status: 'unavailable' },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText(/temporarily unavailable/i)
    ).toBeInTheDocument();
    await expect(canvas.queryByRole('article')).not.toBeInTheDocument();
  },
};

// No repertoireUrl: the whole section, heading included, is left out.
export const Omitted: Story = {
  args: {
    result: { status: 'omitted' },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.queryByRole('heading')).not.toBeInTheDocument();
  },
};

export const Dark: Story = {
  // Pins the theme global to dark, which in docs mode would flip the shared
  // <html data-theme> for every story on the page; keep it out of autodocs.
  tags: ['!autodocs'],
  args: {
    result: { status: 'ok', datasets: discoveryDatasets },
  },
  globals: {
    theme: 'dark',
  },
};
