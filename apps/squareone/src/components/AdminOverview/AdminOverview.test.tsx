import {
  getEmptyDiscovery,
  mockDiscovery2x,
  mockDiscoveryDataDev,
} from '@lsst-sqre/repertoire-client';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import AdminOverview from './AdminOverview';

/** The Environment section: the region its heading labels. */
function getEnvironmentRegion(name: string | RegExp): HTMLElement {
  return screen.getByRole('region', { name });
}

describe('AdminOverview', () => {
  test('renders the Overview h1', () => {
    render(<AdminOverview discovery={mockDiscoveryDataDev} />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Overview' })
    ).toBeInTheDocument();
  });

  test('titles the Environment section with the long title', () => {
    render(<AdminOverview discovery={mockDiscoveryDataDev} />);

    const region = getEnvironmentRegion('SQuaRE RSP development');
    expect(within(region).getByRole('heading', { level: 2 })).toHaveTextContent(
      'SQuaRE RSP development'
    );
  });

  test('lists the label, name, and description of a 3.0 environment', () => {
    render(<AdminOverview discovery={mockDiscoveryDataDev} />);

    const region = getEnvironmentRegion('SQuaRE RSP development');
    expect(within(region).getByText('idfdev')).toBeInTheDocument();
    expect(within(region).getByText('data-dev.lsst.cloud')).toBeInTheDocument();
    expect(
      within(region).getByText(/^A development environment/)
    ).toBeInTheDocument();
  });

  test('links to the environment docs', () => {
    render(<AdminOverview discovery={mockDiscoveryDataDev} />);

    const region = getEnvironmentRegion('SQuaRE RSP development');
    expect(
      within(region).getByRole('link', { name: /phalanx documentation/i })
    ).toHaveAttribute('href', 'https://phalanx.lsst.io/environments/idfdev/');
  });

  test('shows only the environment_name for a 2.x discovery', () => {
    render(<AdminOverview discovery={mockDiscovery2x} />);

    const region = getEnvironmentRegion('Environment');
    expect(within(region).getByText('Name')).toBeInTheDocument();
    expect(within(region).getByText('data.lsst.cloud')).toBeInTheDocument();
    expect(within(region).queryByText('Phalanx label')).not.toBeInTheDocument();
    expect(within(region).queryByText('Description')).not.toBeInTheDocument();
    expect(within(region).queryByRole('link')).not.toBeInTheDocument();
  });

  test('says so when discovery names no environment', () => {
    render(
      <AdminOverview
        discovery={{ ...getEmptyDiscovery(), applications: ['squareone'] }}
      />
    );

    const region = getEnvironmentRegion('Environment');
    expect(
      within(region).getByText(/does not describe this environment/i)
    ).toBeInTheDocument();
  });
});
