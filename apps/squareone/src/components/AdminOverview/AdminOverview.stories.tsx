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

/**
 * Each application's unit in the Applications table: the `<tbody>` holding
 * its name row and the detail row beneath it (every row group but the
 * header's).
 */
function getApplicationRows(canvasElement: HTMLElement): HTMLElement[] {
  const table = within(canvasElement).getByRole('table', {
    name: 'Applications',
  });
  return within(table).getAllByRole('rowgroup').slice(1);
}

/** The application name in each of the Applications table's rows. */
function getApplicationNames(canvasElement: HTMLElement): string[] {
  return getApplicationRows(canvasElement).map(
    (row) => within(row).getAllByRole('cell')[0].textContent ?? ''
  );
}

/** Each dataset's unit in the Datasets table: its name and detail rows. */
function getDatasetRows(canvasElement: HTMLElement): HTMLElement[] {
  const table = within(canvasElement).getByRole('table', { name: 'Datasets' });
  return within(table).getAllByRole('rowgroup').slice(1);
}

/** The dataset key in each of the Datasets table's rows. */
function getDatasetNames(canvasElement: HTMLElement): string[] {
  return getDatasetRows(canvasElement).map(
    (row) => within(row).getAllByRole('cell')[0].textContent ?? ''
  );
}

/** The Datasets table's row for the named dataset. */
function getDatasetRow(canvasElement: HTMLElement, name: string): HTMLElement {
  const row = getDatasetRows(canvasElement).find(
    (candidate) =>
      within(candidate).getAllByRole('cell')[0].textContent === name
  );
  if (!row) throw new Error(`No ${name} dataset row`);
  return row;
}

/** A copy of `discovery` without the Argo CD, Chronograf, and Kafdrop UIs. */
function withoutOperatorTools(discovery: ServiceDiscovery): ServiceDiscovery {
  const { argocd, chronograf, kafdrop, ...ui } = discovery.services.ui;
  return { ...discovery, services: { ...discovery.services, ui } };
}

/**
 * The live data-dev (idfdev) Repertoire 3.0.0 discovery document: under the
 * page heading, a key-value list of the environment's Phalanx label, name,
 * title, and description, with a link to its Phalanx docs. The operator links
 * cover Argo CD, Chronograf, and Kafdrop, the environment docs, and the
 * service discovery page. Each table has a single name column over a detail
 * row: the Applications table lists all 41 applications, with `nublado`
 * joined to both its UI and its `nublado-controller` API, each with its own
 * scopes; the Datasets table lists `dp1`, `dp2`, `dp02`, `dp03`, and `prompt`
 * with their docs, Butler, and ObsCore links where discovery has them; and
 * the InfluxDB databases table lists the local `idfdev_efd` with a button to
 * copy its credentials URL.
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

    await expect(
      canvas.queryByRole('heading', { name: 'SQuaRE RSP development' })
    ).not.toBeInTheDocument();
    await expect(canvas.getByText('idfdev')).toBeInTheDocument();
    await expect(canvas.getByText('data-dev.lsst.cloud')).toBeInTheDocument();
    await expect(
      canvas.getByText('SQuaRE RSP development')
    ).toBeInTheDocument();
    await expect(
      canvas.getByText(/^A development environment/)
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('link', { name: 'Phalanx idfdev documentation' })
    ).toHaveAttribute('href', 'https://phalanx.lsst.io/environments/idfdev/');

    await expect(getOperatorCardTitles(canvasElement)).toEqual([
      'Argo CD',
      'Chronograf metrics viewer',
      'Kafdrop Kafka viewer',
      'Environment documentation',
      'Service discovery',
    ]);

    await expect(
      canvas.getByRole('link', { name: 'Service discovery' })
    ).toHaveAttribute('href', '/admin/discovery');

    await expect(getApplicationRows(canvasElement)).toHaveLength(41);
    const nublado = getApplicationRows(canvasElement).find(
      (row) => within(row).getAllByRole('cell')[0].textContent === 'nublado'
    );
    if (!nublado) throw new Error('No nublado row');
    await expect(
      within(nublado).getByRole('link', {
        name: 'https://nb.data-dev.lsst.cloud/nb',
      })
    ).toBeInTheDocument();
    await expect(
      within(nublado).getByText('nublado-controller')
    ).toBeInTheDocument();
    await expect(
      within(nublado).getByRole('list', {
        name: 'nublado-controller required scopes',
      })
    ).toHaveTextContent('admin:jupyterlab');

    await expect(getDatasetNames(canvasElement)).toEqual([
      'dp1',
      'dp2',
      'dp02',
      'dp03',
      'prompt',
    ]);
    const dp1 = within(getDatasetRow(canvasElement, 'dp1'));
    await expect(
      dp1.getByRole('link', { name: 'dp1 documentation' })
    ).toHaveAttribute('href', 'https://dp1.lsst.io/');
    await expect(
      dp1.getByRole('link', { name: 'dp1 Butler config' })
    ).toBeInTheDocument();
    await expect(
      dp1.getByRole('link', { name: 'dp1 ObsCore config' })
    ).toBeInTheDocument();
    const prompt = within(getDatasetRow(canvasElement, 'prompt'));
    await expect(prompt.getAllByRole('link')).toHaveLength(1);

    const influx = within(
      canvas.getByRole('table', { name: 'InfluxDB databases' })
    );
    await expect(influx.getAllByRole('rowgroup')).toHaveLength(2);
    await expect(influx.getByText('idfdev_efd')).toBeInTheDocument();
    await expect(influx.getByText('local')).toBeInTheDocument();
    await expect(influx.getByText('Credentials URL')).toBeInTheDocument();
    await expect(
      influx.getByRole('button', {
        name: 'Copy the idfdev_efd credentials URL to the clipboard',
      })
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
 * there is no `environment` object, so the key-value list shows only the
 * deprecated `environment_name`. Services carry no titles, so the operator
 * links fall back to fixed names, there is no environment docs link, and the
 * Applications table rows have no titles, docs links, or scopes. The five
 * datasets have no ObsCore config, and there are no InfluxDB databases.
 */
export const Repertoire2x: Story = {
  args: {
    discovery: mockDiscovery2x,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getAllByRole('term')).toHaveLength(1);
    await expect(canvas.getByText('data.lsst.cloud')).toBeInTheDocument();
    await expect(canvas.queryByText('Phalanx label')).not.toBeInTheDocument();
    await expect(
      canvas.queryByRole('link', { name: /phalanx .*documentation/i })
    ).not.toBeInTheDocument();

    await expect(getOperatorCardTitles(canvasElement)).toEqual([
      'Argo CD',
      'Chronograf',
      'Kafdrop',
      'Service discovery',
    ]);

    await expect(getApplicationRows(canvasElement)).toHaveLength(29);

    await expect(getDatasetNames(canvasElement)).toEqual([
      'dp1',
      'dp2',
      'dp02',
      'dp03',
      'prompt',
    ]);
    await expect(
      canvas.queryByRole('link', { name: /ObsCore config/ })
    ).not.toBeInTheDocument();
    await expect(
      canvas.getByText('Service discovery lists no InfluxDB databases.')
    ).toBeInTheDocument();
  },
};

/**
 * A Repertoire 2.x environment that runs none of the operator tools: there is
 * no card for Argo CD, Chronograf, or Kafdrop, only the service discovery
 * page link, and the Applications table still renders.
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

/**
 * An environment whose discovery lists no datasets and no InfluxDB databases:
 * each section says so instead of showing an empty table.
 */
export const WithoutDatasetsOrInfluxDB: Story = {
  args: {
    discovery: {
      ...mockDiscoveryDataDev,
      datasets: {},
      influxdb_databases: {},
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      within(canvas.getByRole('region', { name: 'Datasets' })).getByText(
        'Service discovery lists no datasets.'
      )
    ).toBeInTheDocument();
    await expect(
      within(
        canvas.getByRole('region', { name: 'InfluxDB databases' })
      ).getByText('Service discovery lists no InfluxDB databases.')
    ).toBeInTheDocument();
    await expect(
      canvas.queryByRole('table', { name: 'Datasets' })
    ).not.toBeInTheDocument();
  },
};
