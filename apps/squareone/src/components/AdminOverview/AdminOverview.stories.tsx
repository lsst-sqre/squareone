import {
  mockDiscovery2x,
  mockDiscoveryDataDev,
  type ServiceDiscovery,
} from '@lsst-sqre/repertoire-client';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import AdminOverview from './AdminOverview';

const meta: Meta<typeof AdminOverview> = {
  title: 'Components/AdminOverview',
  component: AdminOverview,
  parameters: {
    layout: 'padded',
  },
  args: {
    repertoireUrl: 'https://data-dev.lsst.cloud/repertoire',
  },
  // Run these stories as interaction tests in the `storybook` vitest project.
  tags: ['test'],
};

export default meta;
type Story = StoryObj<typeof meta>;

/** The headings of the Operator links section's cards, in order. */
function getOperatorCardTitles(canvasElement: HTMLElement): string[] {
  const region = within(canvasElement).getByRole('region', {
    name: 'Operator links',
  });
  return within(region)
    .getAllByRole('article')
    .map((card) => within(card).getByRole('heading').textContent ?? '');
}

/** The Applications table's body rows (every row but the header). */
function getApplicationRows(canvasElement: HTMLElement): HTMLElement[] {
  const table = within(canvasElement).getByRole('table', {
    name: 'Applications',
  });
  return within(table).getAllByRole('row').slice(1);
}

/** The application name in each of the Applications table's rows. */
function getApplicationNames(canvasElement: HTMLElement): string[] {
  return getApplicationRows(canvasElement).map(
    (row) => within(row).getAllByRole('cell')[0].textContent ?? ''
  );
}

/** A copy of `discovery` without the Argo CD, Chronograf, and Kafdrop UIs. */
function withoutOperatorTools(discovery: ServiceDiscovery): ServiceDiscovery {
  const { argocd, chronograf, kafdrop, ...ui } = discovery.services.ui;
  return { ...discovery, services: { ...discovery.services, ui } };
}

/**
 * The live data-dev (idfdev) Repertoire 3.0.0 discovery document: the
 * Environment section is titled by the environment's long title and lists its
 * Phalanx label, name, and description, with a link to its Phalanx docs. The
 * operator links cover Argo CD, Chronograf, and Kafdrop, the environment docs,
 * and the raw discovery document, and the Applications table lists all 41
 * applications, with `nublado` joined to both its UI and its
 * `nublado-controller` API.
 */
export const DataDev: Story = {
  args: {
    discovery: mockDiscoveryDataDev,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('heading', { level: 1, name: 'Overview' })
    ).toBeInTheDocument();

    const environment = canvas.getByRole('region', {
      name: 'SQuaRE RSP development',
    });
    const section = within(environment);
    await expect(section.getByText('idfdev')).toBeInTheDocument();
    await expect(section.getByText('data-dev.lsst.cloud')).toBeInTheDocument();
    await expect(
      section.getByText(/^A development environment/)
    ).toBeInTheDocument();
    await expect(
      section.getByRole('link', { name: 'Phalanx documentation' })
    ).toHaveAttribute('href', 'https://phalanx.lsst.io/environments/idfdev/');

    await expect(getOperatorCardTitles(canvasElement)).toEqual([
      'Argo CD',
      'Chronograf metrics viewer',
      'Kafdrop Kafka viewer',
      'Environment documentation',
      'Service discovery',
    ]);

    await expect(getApplicationRows(canvasElement)).toHaveLength(41);
    const nublado = getApplicationRows(canvasElement).find(
      (row) => within(row).getAllByRole('cell')[0].textContent === 'nublado'
    );
    if (!nublado) throw new Error('No nublado row');
    await expect(within(nublado).getByText('UI + API')).toBeInTheDocument();
    await expect(
      within(nublado).getByText('nublado-controller')
    ).toBeInTheDocument();
  },
};

/**
 * Filtering and sorting the Applications table: typing narrows the rows to
 * the applications whose name or title matches, and the column headers sort
 * what remains.
 */
export const FilteredApplications: Story = {
  args: {
    discovery: mockDiscoveryDataDev,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.type(
      canvas.getByRole('searchbox', { name: 'Filter applications' }),
      'tap'
    );
    await expect(getApplicationNames(canvasElement)).toEqual([
      'obsforgetap',
      'ppdbtap',
      'ssotap',
      'tap',
      'usertap',
    ]);
    await expect(canvas.getByText('5 of 41 applications')).toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'Application' }));
    await expect(getApplicationNames(canvasElement)[0]).toBe('usertap');
  },
};

/**
 * An environment still on Repertoire 2.x (the production 2.1.0 document):
 * there is no `environment` object, so the section falls back to an
 * "Environment" heading and shows only the deprecated `environment_name`.
 * Services carry no titles, so the operator links fall back to fixed names,
 * there is no environment docs link, and the Applications table rows have no
 * titles, docs links, or scopes.
 */
export const Repertoire2x: Story = {
  args: {
    discovery: mockDiscovery2x,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const environment = canvas.getByRole('region', { name: 'Environment' });
    const section = within(environment);
    await expect(section.getByText('data.lsst.cloud')).toBeInTheDocument();
    await expect(section.queryByText('Phalanx label')).not.toBeInTheDocument();
    await expect(section.queryByRole('link')).not.toBeInTheDocument();

    await expect(getOperatorCardTitles(canvasElement)).toEqual([
      'Argo CD',
      'Chronograf',
      'Kafdrop',
      'Service discovery',
    ]);

    await expect(getApplicationRows(canvasElement)).toHaveLength(29);
  },
};

/**
 * A Repertoire 2.x environment that runs none of the operator tools: there is
 * no card for Argo CD, Chronograf, or Kafdrop, only the raw discovery link,
 * and the Applications table still renders.
 */
export const WithoutOperatorTools: Story = {
  args: {
    discovery: withoutOperatorTools(mockDiscovery2x),
  },
  play: async ({ canvasElement }) => {
    await expect(getOperatorCardTitles(canvasElement)).toEqual([
      'Service discovery',
    ]);
    await expect(getApplicationRows(canvasElement)).toHaveLength(29);
  },
};
