import { mockDiscoveryDataDev } from '@lsst-sqre/repertoire-client';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { buildDatasetRows } from '../../lib/admin/overview';
import DatasetsTable from './DatasetsTable';

const rows = buildDatasetRows(mockDiscoveryDataDev);

/** The table's body rows (every row but the header). */
function getBodyRows(): HTMLElement[] {
  const table = screen.getByRole('table', { name: 'Datasets' });
  return within(table).getAllByRole('row').slice(1);
}

/** The body row for the named dataset. */
function getRow(name: string): HTMLElement {
  const row = getBodyRows().find(
    (candidate) =>
      within(candidate).getAllByRole('cell')[0].textContent === name
  );
  if (!row) throw new Error(`No row for ${name}`);
  return row;
}

describe('DatasetsTable', () => {
  test('lists every dataset in discovery order', () => {
    render(<DatasetsTable rows={rows} />);

    expect(
      getBodyRows().map(
        (row) => within(row).getAllByRole('cell')[0].textContent
      )
    ).toEqual(['dp1', 'dp2', 'dp02', 'dp03', 'prompt']);
  });

  test('links the docs, Butler config, and ObsCore config of a dataset', () => {
    render(<DatasetsTable rows={rows} />);

    const row = within(getRow('dp1'));
    expect(
      row.getByRole('link', { name: 'dp1 documentation' })
    ).toHaveAttribute('href', 'https://dp1.lsst.io/');
    expect(
      row.getByRole('link', { name: 'dp1 Butler config' })
    ).toHaveAttribute(
      'href',
      'https://data-dev.lsst.cloud/api/butler/repo/dp1/butler.yaml'
    );
    expect(
      row.getByRole('link', { name: 'dp1 ObsCore config' })
    ).toHaveAttribute(
      'href',
      'https://raw.githubusercontent.com/lsst-dm/dax_obscore/refs/heads/main/configs/dp1.yaml'
    );
  });

  test('lists the services a dataset exposes', () => {
    render(<DatasetsTable rows={rows} />);

    const services = within(getRow('dp03')).getByRole('list', {
      name: 'dp03 services',
    });
    expect(
      within(services)
        .getAllByRole('listitem')
        .map((item) => item.textContent)
    ).toEqual(['gms', 'tap']);
  });

  test('shows a dash for each absent optional field', () => {
    render(<DatasetsTable rows={rows} />);

    const row = within(getRow('prompt'));
    expect(row.getByText('Prompt products.')).toBeInTheDocument();
    expect(row.getAllByRole('link')).toHaveLength(1);
    expect(
      row.getByRole('link', { name: 'prompt ObsCore config' })
    ).toBeInTheDocument();
    // No docs URL and no Butler config.
    expect(row.getAllByText('—')).toHaveLength(2);
  });

  test('shows a dash for a dataset with no description or services', () => {
    render(
      <DatasetsTable
        rows={[
          {
            name: 'bare',
            description: null,
            docsUrl: null,
            butlerConfigUrl: null,
            obscoreConfigUrl: null,
            services: [],
          },
        ]}
      />
    );

    const row = within(getRow('bare'));
    expect(row.queryByRole('link')).not.toBeInTheDocument();
    expect(row.queryByRole('list')).not.toBeInTheDocument();
    expect(row.getAllByText('—')).toHaveLength(5);
  });

  test('says so when discovery lists no datasets', () => {
    render(<DatasetsTable rows={[]} />);

    const region = screen.getByRole('region', { name: 'Datasets' });
    expect(within(region).queryByRole('table')).not.toBeInTheDocument();
    expect(
      within(region).getByText('Service discovery lists no datasets.')
    ).toBeInTheDocument();
  });
});
