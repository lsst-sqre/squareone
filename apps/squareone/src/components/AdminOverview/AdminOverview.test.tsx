import {
  getEmptyDiscovery,
  mockDiscovery2x,
  mockDiscoveryDataDev,
  type ServiceDiscovery,
} from '@lsst-sqre/repertoire-client';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import AdminOverview from './AdminOverview';

/** Renders the overview of `discovery`. */
function renderOverview(discovery: ServiceDiscovery) {
  return render(<AdminOverview discovery={discovery} />);
}

/**
 * The terms of the environment key-value list under the page heading (the
 * InfluxDB databases table's detail rows are key-value lists too, so those
 * inside a table are left out).
 */
function getEnvironmentTerms(): string[] {
  return screen
    .getAllByRole('term')
    .filter((term) => !term.closest('table'))
    .map((term) => term.textContent ?? '');
}

/** The Operator links section's card titled `name`. */
function getOperatorCard(name: string): HTMLElement {
  const region = screen.getByRole('region', { name: 'Operator links' });
  const card = within(region)
    .getAllByRole('article')
    .find((article) => within(article).queryByRole('link', { name }));
  if (!card) throw new Error(`No operator link card for ${name}`);
  return card;
}

describe('AdminOverview', () => {
  test('renders the Overview h1', () => {
    renderOverview(mockDiscoveryDataDev);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Overview' })
    ).toBeInTheDocument();
  });

  test('lists the environment facts straight under the heading, with no h2', () => {
    renderOverview(mockDiscoveryDataDev);

    expect(getEnvironmentTerms()).toEqual([
      'Phalanx label',
      'Name',
      'Title',
      'Description',
      'Documentation',
    ]);
    expect(
      screen.queryByRole('heading', { name: 'SQuaRE RSP development' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/as Repertoire service discovery describes it/)
    ).not.toBeInTheDocument();
  });

  test('lists the label, name, title, and description of a 3.0 environment', () => {
    renderOverview(mockDiscoveryDataDev);

    expect(screen.getByText('idfdev')).toBeInTheDocument();
    expect(screen.getByText('data-dev.lsst.cloud')).toBeInTheDocument();
    expect(screen.getByText('SQuaRE RSP development')).toBeInTheDocument();
    expect(screen.getByText(/^A development environment/)).toBeInTheDocument();
  });

  test('links to the environment docs, naming the Phalanx environment', () => {
    renderOverview(mockDiscoveryDataDev);

    expect(
      screen.getByRole('link', { name: 'Phalanx idfdev documentation' })
    ).toHaveAttribute('href', 'https://phalanx.lsst.io/environments/idfdev/');
  });

  test('shows only the environment_name for a 2.x discovery', () => {
    renderOverview(mockDiscovery2x);

    expect(getEnvironmentTerms()).toEqual(['Name']);
    expect(screen.getByText('data.lsst.cloud')).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /phalanx .*documentation/i })
    ).not.toBeInTheDocument();
  });

  test('says so when discovery names no environment', () => {
    renderOverview({ ...getEmptyDiscovery(), applications: ['squareone'] });

    expect(
      screen.getByText(/does not describe this environment/i)
    ).toBeInTheDocument();
  });

  test('links the operator tools, environment docs, and discovery page', () => {
    renderOverview(mockDiscoveryDataDev);

    const region = screen.getByRole('region', { name: 'Operator links' });
    expect(
      within(region)
        .getAllByRole('article')
        .map((card) => within(card).getByRole('heading').textContent)
    ).toEqual([
      'Argo CD',
      'Chronograf metrics viewer',
      'Kafdrop Kafka viewer',
      'Environment documentation',
      'Service discovery',
    ]);
    expect(
      within(region).getByRole('link', { name: 'Argo CD' })
    ).toHaveAttribute('href', 'https://data-dev.lsst.cloud/argo-cd');
    expect(
      within(region).getByRole('link', { name: 'Environment documentation' })
    ).toHaveAttribute('href', 'https://phalanx.lsst.io/environments/idfdev/');
    expect(
      within(region).getByRole('link', { name: 'Service discovery' })
    ).toHaveAttribute('href', '/admin/discovery');
  });

  test("links an operator tool's own documentation when it has some", () => {
    renderOverview(mockDiscoveryDataDev);

    expect(
      within(getOperatorCard('Argo CD')).getByRole('link', {
        name: 'Argo CD documentation',
      })
    ).toHaveAttribute('href', 'https://argo-cd.readthedocs.io/en/stable/');
    expect(
      within(getOperatorCard('Chronograf metrics viewer')).getAllByRole('link')
    ).toHaveLength(1);
  });

  test('has no card for an operator tool that discovery does not list', () => {
    const ui = { ...mockDiscovery2x.services.ui };
    delete ui.kafdrop;
    renderOverview({
      ...mockDiscovery2x,
      services: { ...mockDiscovery2x.services, ui },
    });

    const region = screen.getByRole('region', { name: 'Operator links' });
    expect(
      within(region).queryByRole('link', { name: 'Kafdrop' })
    ).not.toBeInTheDocument();
    expect(
      within(region).getByRole('link', { name: 'Argo CD' })
    ).toBeInTheDocument();
    expect(
      within(region).queryByRole('link', { name: 'Environment documentation' })
    ).not.toBeInTheDocument();
  });

  test('lists every application in the Applications section', () => {
    renderOverview(mockDiscoveryDataDev);

    const region = screen.getByRole('region', { name: 'Applications' });
    const table = within(region).getByRole('table', { name: 'Applications' });
    // One row group (name row plus detail row) per application, after the
    // header's.
    expect(within(table).getAllByRole('rowgroup')).toHaveLength(42);
  });

  test('lists the datasets and InfluxDB databases after the applications', () => {
    renderOverview(mockDiscoveryDataDev);

    expect(
      screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)
    ).toEqual([
      'Operator links',
      'Applications',
      'Datasets',
      'InfluxDB databases',
    ]);
  });

  test('lists every dataset in the Datasets section', () => {
    renderOverview(mockDiscoveryDataDev);

    const region = screen.getByRole('region', { name: 'Datasets' });
    const table = within(region).getByRole('table', { name: 'Datasets' });
    expect(
      within(table)
        .getAllByRole('rowgroup')
        .slice(1)
        .map((group) => within(group).getAllByRole('cell')[0].textContent)
    ).toEqual(['dp1', 'dp2', 'dp02', 'dp03', 'prompt']);
  });

  test('lists the local InfluxDB database in its section', () => {
    renderOverview(mockDiscoveryDataDev);

    const region = screen.getByRole('region', { name: 'InfluxDB databases' });
    const groups = within(region).getAllByRole('rowgroup').slice(1);
    expect(groups).toHaveLength(1);
    expect(within(groups[0]).getByText('idfdev_efd')).toBeInTheDocument();
    expect(within(groups[0]).getByText('local')).toBeInTheDocument();
  });

  test('says so when discovery lists no datasets or InfluxDB databases', () => {
    renderOverview({ ...getEmptyDiscovery(), applications: ['squareone'] });

    expect(
      within(screen.getByRole('region', { name: 'Datasets' })).getByText(
        'Service discovery lists no datasets.'
      )
    ).toBeInTheDocument();
    expect(
      within(
        screen.getByRole('region', { name: 'InfluxDB databases' })
      ).getByText('Service discovery lists no InfluxDB databases.')
    ).toBeInTheDocument();
  });

  test('renders the Applications table for a 2.x discovery', () => {
    renderOverview(mockDiscovery2x);

    const region = screen.getByRole('region', { name: 'Applications' });
    expect(within(region).getByText('29 applications')).toBeInTheDocument();
    expect(within(region).getAllByRole('rowgroup')).toHaveLength(30);
  });
});
