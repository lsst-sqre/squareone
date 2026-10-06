import { mockDiscoveryDataDev } from '@lsst-sqre/repertoire-client';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { buildInfluxRows, type InfluxRow } from '../../lib/admin/overview';
import InfluxTable from './InfluxTable';

const rows = buildInfluxRows(mockDiscoveryDataDev);

/** A database that is not local to the environment. */
const remoteRow: InfluxRow = {
  name: 'summit_efd',
  database: 'efd',
  url: 'https://summit-lsp.lsst.codes/influxdb-enterprise-data/',
  local: false,
  schemaRegistryUrl: 'http://sasquatch-schema-registry.sasquatch:8081/',
  credentialsUrl:
    'https://data-dev.lsst.cloud/repertoire/discovery/influxdb/summit_efd',
};

/** The table's body rows (every row but the header). */
function getBodyRows(): HTMLElement[] {
  const table = screen.getByRole('table', { name: 'InfluxDB databases' });
  return within(table).getAllByRole('row').slice(1);
}

describe('InfluxTable', () => {
  test('describes the data-dev EFD database', () => {
    render(<InfluxTable rows={rows} />);

    const [row] = getBodyRows();
    const cells = within(row).getAllByRole('cell');
    expect(cells[0]).toHaveTextContent(/^idfdev_efd/);
    expect(cells[1]).toHaveTextContent('efd');
    expect(cells[2]).toHaveTextContent('https://data-dev.lsst.cloud/influxdb/');
    expect(cells[3]).toHaveTextContent(
      'http://sasquatch-schema-registry.sasquatch:8081/'
    );
  });

  test('flags a database local to the environment', () => {
    render(<InfluxTable rows={rows} />);

    const [row] = getBodyRows();
    expect(within(row).getByText('local')).toBeInTheDocument();
  });

  test('does not flag a database from another environment', () => {
    render(<InfluxTable rows={[remoteRow]} />);

    const [row] = getBodyRows();
    expect(within(row).queryByText('local')).not.toBeInTheDocument();
  });

  test('shows the credentials URL with a button to copy it', () => {
    render(<InfluxTable rows={rows} />);

    const [row] = getBodyRows();
    expect(
      within(row).getByText(
        'https://data-dev.lsst.cloud/repertoire/discovery/influxdb/idfdev_efd'
      )
    ).toBeInTheDocument();
    expect(
      within(row).getByRole('button', {
        name: 'Copy the idfdev_efd credentials URL to the clipboard',
      })
    ).toBeInTheDocument();
  });

  test('does not link the credentials URL, so it is never fetched', () => {
    render(<InfluxTable rows={rows} />);

    const credentialsUrl = within(getBodyRows()[0]).getByText(
      'https://data-dev.lsst.cloud/repertoire/discovery/influxdb/idfdev_efd'
    );
    expect(credentialsUrl.closest('a')).toBeNull();
  });

  test('says so when discovery lists no InfluxDB databases', () => {
    render(<InfluxTable rows={[]} />);

    const region = screen.getByRole('region', { name: 'InfluxDB databases' });
    expect(within(region).queryByRole('table')).not.toBeInTheDocument();
    expect(
      within(region).getByText('Service discovery lists no InfluxDB databases.')
    ).toBeInTheDocument();
  });
});
