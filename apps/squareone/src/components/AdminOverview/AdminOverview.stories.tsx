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

/** The links in the Applications list, in display order. */
function getApplicationLinks(canvasElement: HTMLElement): HTMLElement[] {
  const list = within(canvasElement).getByRole('list', {
    name: 'Applications',
  });
  return within(list).getAllByRole('link');
}

/** Each service's unit in the Services table: its name and detail rows. */
function getServiceRows(canvasElement: HTMLElement): HTMLElement[] {
  const table = within(canvasElement).getByRole('table', { name: 'Services' });
  return within(table).getAllByRole('rowgroup').slice(1);
}

/** The service name in each of the Services table's rows. */
function getServiceNames(canvasElement: HTMLElement): string[] {
  return getServiceRows(canvasElement).map(
    (row) => within(row).getAllByRole('cell')[0].textContent ?? ''
  );
}

/** The Services table's row for the named service. */
function getServiceRow(canvasElement: HTMLElement, name: string): HTMLElement {
  const row = getServiceRows(canvasElement).find(
    (candidate) =>
      within(candidate).getAllByRole('cell')[0].textContent === name
  );
  if (!row) throw new Error(`No ${name} service row`);
  return row;
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
 * service discovery page. The Applications list links all 41 applications,
 * alphabetically, to their Phalanx documentation pages. Each table has a
 * name column over a detail row: the Services table lists the 10 UI and 11
 * API services, including `comanage`, `logout`, `settings`, and `webdav`,
 * which belong to no application of that name, and `nublado-controller` as
 * its own API row with its scope and OpenAPI link; the Datasets table lists
 * `dp1`, `dp2`, `dp02`, `dp03`, and `prompt` with their docs, Butler, and
 * ObsCore links where discovery has them; and the InfluxDB databases table
 * lists the local `idfdev_efd` with a button to copy its credentials URL.
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

    const applications = within(
      canvas.getByRole('region', { name: 'Applications' })
    );
    await expect(applications.getByText('41 applications')).toBeInTheDocument();
    const applicationLinks = getApplicationLinks(canvasElement);
    await expect(applicationLinks.map((link) => link.textContent)).toEqual(
      mockDiscoveryDataDev.applications
    );
    await expect(
      applications.getByRole('link', { name: 'nublado' })
    ).toHaveAttribute('href', 'https://phalanx.lsst.io/applications/nublado/');
    await expect(
      applications.queryByText('nublado-controller')
    ).not.toBeInTheDocument();
    await expect(applications.queryByRole('table')).not.toBeInTheDocument();

    const services = within(canvas.getByRole('region', { name: 'Services' }));
    await expect(services.getByText('21 services')).toBeInTheDocument();
    await expect(getServiceNames(canvasElement)).toHaveLength(21);
    for (const name of ['comanage', 'logout', 'settings', 'webdav']) {
      await expect(getServiceNames(canvasElement)).toContain(name);
    }
    await expect(
      services.getByRole('list', { name: 'nublado-controller required scopes' })
    ).toHaveTextContent('admin:jupyterlab');
    await expect(
      services.getByRole('link', {
        name: 'nublado-controller OpenAPI specification',
      })
    ).toHaveAttribute(
      'href',
      'https://data-dev.lsst.cloud/nublado/openapi.json'
    );

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
 * The data-dev discovery with "nublado" typed into the Services filter: the
 * table narrows to the `nublado` UI and the `nublado-controller` API, and the
 * count reads "2 of 21 services". Sorting by Kind puts the API first, and
 * clearing the filter restores every service.
 */
export const FilteredServices: Story = {
  args: {
    discovery: mockDiscoveryDataDev,
  },
  play: async ({ canvasElement }) => {
    const services = within(
      within(canvasElement).getByRole('region', { name: 'Services' })
    );
    const filter = services.getByRole('searchbox', { name: 'Filter services' });

    await userEvent.type(filter, 'nublado');
    await expect(getServiceNames(canvasElement)).toEqual([
      'nublado',
      'nublado-controller',
    ]);
    await expect(services.getByText('2 of 21 services')).toBeInTheDocument();

    await userEvent.click(services.getByRole('button', { name: 'Kind' }));
    await expect(getServiceNames(canvasElement)).toEqual([
      'nublado-controller',
      'nublado',
    ]);

    await userEvent.clear(filter);
    await expect(getServiceNames(canvasElement)).toHaveLength(21);
    await expect(services.getByText('21 services')).toBeInTheDocument();
  },
};

/**
 * An environment still on Repertoire 2.x (the production 2.1.0 document):
 * there is no `environment` object, so the key-value list shows only the
 * deprecated `environment_name`. Services carry no titles, so the operator
 * links fall back to fixed names and there is no environment docs link. The
 * Applications list links its 29 applications; the Services table lists 19
 * services with no titles, scopes, or docs links, so a service without an
 * OpenAPI spec shows just its URL; the five datasets have no ObsCore config;
 * and there are no InfluxDB databases.
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

    await expect(getApplicationLinks(canvasElement)).toHaveLength(29);

    await expect(getServiceNames(canvasElement)).toHaveLength(19);
    const login = getServiceRow(canvasElement, 'login');
    await expect(within(login).getAllByRole('row')[1]).toHaveTextContent(
      /^https:\/\/data\.lsst\.cloud\/login$/
    );

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
 * page link, and the Applications list still renders.
 */
export const WithoutOperatorTools: Story = {
  args: {
    discovery: withoutOperatorTools(mockDiscovery2x),
  },
  play: async ({ canvasElement }) => {
    await expect(getOperatorCardTitles(canvasElement)).toEqual([
      'Service discovery',
    ]);
    await expect(getApplicationLinks(canvasElement)).toHaveLength(29);
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
