import {
  getEmptyDiscovery,
  mockDiscovery2x,
  mockDiscoveryDataDev,
  type ServiceDiscovery,
} from '@lsst-sqre/repertoire-client';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import AdminOverview from './AdminOverview';

const REPERTOIRE_URL = 'https://data-dev.lsst.cloud/repertoire';

/** Renders the overview of `discovery`, read from {@link REPERTOIRE_URL}. */
function renderOverview(discovery: ServiceDiscovery) {
  return render(
    <AdminOverview discovery={discovery} repertoireUrl={REPERTOIRE_URL} />
  );
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

/** The Environment section: the region its heading labels. */
function getEnvironmentRegion(name: string | RegExp): HTMLElement {
  return screen.getByRole('region', { name });
}

describe('AdminOverview', () => {
  test('renders the Overview h1', () => {
    renderOverview(mockDiscoveryDataDev);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Overview' })
    ).toBeInTheDocument();
  });

  test('titles the Environment section with the long title', () => {
    renderOverview(mockDiscoveryDataDev);

    const region = getEnvironmentRegion('SQuaRE RSP development');
    expect(within(region).getByRole('heading', { level: 2 })).toHaveTextContent(
      'SQuaRE RSP development'
    );
  });

  test('lists the label, name, and description of a 3.0 environment', () => {
    renderOverview(mockDiscoveryDataDev);

    const region = getEnvironmentRegion('SQuaRE RSP development');
    expect(within(region).getByText('idfdev')).toBeInTheDocument();
    expect(within(region).getByText('data-dev.lsst.cloud')).toBeInTheDocument();
    expect(
      within(region).getByText(/^A development environment/)
    ).toBeInTheDocument();
  });

  test('links to the environment docs', () => {
    renderOverview(mockDiscoveryDataDev);

    const region = getEnvironmentRegion('SQuaRE RSP development');
    expect(
      within(region).getByRole('link', { name: /phalanx documentation/i })
    ).toHaveAttribute('href', 'https://phalanx.lsst.io/environments/idfdev/');
  });

  test('shows only the environment_name for a 2.x discovery', () => {
    renderOverview(mockDiscovery2x);

    const region = getEnvironmentRegion('Environment');
    expect(within(region).getByText('Name')).toBeInTheDocument();
    expect(within(region).getByText('data.lsst.cloud')).toBeInTheDocument();
    expect(within(region).queryByText('Phalanx label')).not.toBeInTheDocument();
    expect(within(region).queryByText('Description')).not.toBeInTheDocument();
    expect(within(region).queryByRole('link')).not.toBeInTheDocument();
  });

  test('says so when discovery names no environment', () => {
    renderOverview({ ...getEmptyDiscovery(), applications: ['squareone'] });

    const region = getEnvironmentRegion('Environment');
    expect(
      within(region).getByText(/does not describe this environment/i)
    ).toBeInTheDocument();
  });

  test('links the operator tools, environment docs, and raw discovery', () => {
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
    ).toHaveAttribute('href', `${REPERTOIRE_URL}/discovery`);
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
    expect(within(table).getAllByRole('row')).toHaveLength(42);
  });

  test('renders the Applications table for a 2.x discovery', () => {
    renderOverview(mockDiscovery2x);

    const region = screen.getByRole('region', { name: 'Applications' });
    expect(within(region).getByText('29 applications')).toBeInTheDocument();
    expect(within(region).getAllByRole('row')).toHaveLength(30);
  });
});
