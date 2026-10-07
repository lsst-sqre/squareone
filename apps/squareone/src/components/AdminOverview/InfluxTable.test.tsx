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

/**
 * Each database's unit in the table: the `<tbody>` holding its name row and
 * the detail row beneath it (every row group but the header's).
 */
function getRowGroups(): HTMLElement[] {
  const table = screen.getByRole('table', { name: 'InfluxDB databases' });
  return within(table).getAllByRole('rowgroup').slice(1);
}

describe('InfluxTable', () => {
  test('describes the data-dev EFD database in its detail row', () => {
    render(<InfluxTable rows={rows} />);

    expect(screen.getAllByRole('columnheader')).toHaveLength(1);
    const [group] = getRowGroups();
    const [nameRow, detailRow] = within(group).getAllByRole('row');
    expect(nameRow).toHaveTextContent(/^idfdev_efd/);
    expect(
      within(detailRow)
        .getAllByRole('term')
        .map((term) => term.textContent)
    ).toEqual(['Database', 'URL', 'Schema registry', 'Credentials URL']);
    const [database, url, schemaRegistry, credentials] =
      within(detailRow).getAllByRole('definition');
    expect(database).toHaveTextContent(/^efd$/);
    expect(url).toHaveTextContent('https://data-dev.lsst.cloud/influxdb/');
    expect(schemaRegistry).toHaveTextContent(
      'http://sasquatch-schema-registry.sasquatch:8081/'
    );
    expect(credentials).toHaveTextContent(
      'https://data-dev.lsst.cloud/repertoire/discovery/influxdb/idfdev_efd'
    );
  });

  test('flags a database local to the environment', () => {
    render(<InfluxTable rows={rows} />);

    const [group] = getRowGroups();
    expect(within(group).getByText('local')).toBeInTheDocument();
  });

  test('does not flag a database from another environment', () => {
    render(<InfluxTable rows={[remoteRow]} />);

    const [group] = getRowGroups();
    expect(within(group).queryByText('local')).not.toBeInTheDocument();
  });

  test('shows the credentials URL with a button to copy it', () => {
    render(<InfluxTable rows={rows} />);

    const [group] = getRowGroups();
    expect(
      within(group).getByText(
        'https://data-dev.lsst.cloud/repertoire/discovery/influxdb/idfdev_efd'
      )
    ).toBeInTheDocument();
    expect(
      within(group).getByRole('button', {
        name: 'Copy the idfdev_efd credentials URL to the clipboard',
      })
    ).toBeInTheDocument();
  });

  test('does not link the credentials URL, so it is never fetched', () => {
    render(<InfluxTable rows={rows} />);

    const credentialsUrl = within(getRowGroups()[0]).getByText(
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
