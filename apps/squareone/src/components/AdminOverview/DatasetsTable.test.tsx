import { mockDiscoveryDataDev } from '@lsst-sqre/repertoire-client';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { buildDatasetRows } from '../../lib/admin/overview';
import DatasetsTable from './DatasetsTable';

const rows = buildDatasetRows(mockDiscoveryDataDev);

/**
 * Each dataset's unit in the table: the `<tbody>` holding its name row and
 * the detail row beneath it (every row group but the header's).
 */
function getRowGroups(): HTMLElement[] {
  const table = screen.getByRole('table', { name: 'Datasets' });
  return within(table).getAllByRole('rowgroup').slice(1);
}

/** The row group for the named dataset. */
function getRow(name: string): HTMLElement {
  const group = getRowGroups().find(
    (candidate) =>
      within(candidate).getAllByRole('cell')[0].textContent === name
  );
  if (!group) throw new Error(`No row for ${name}`);
  return group;
}

describe('DatasetsTable', () => {
  test('lists every dataset in discovery order', () => {
    render(<DatasetsTable rows={rows} />);

    expect(
      getRowGroups().map(
        (group) => within(group).getAllByRole('cell')[0].textContent
      )
    ).toEqual(['dp1', 'dp2', 'dp02', 'dp03', 'prompt']);
  });

  test('has only the name column, with the description in a detail row', () => {
    render(<DatasetsTable rows={rows} />);

    expect(screen.getAllByRole('columnheader')).toHaveLength(1);
    const [nameRow, detailRow] = within(getRow('prompt')).getAllByRole('row');
    expect(nameRow).toHaveTextContent(/^prompt$/);
    expect(detailRow).toHaveTextContent('Prompt products.');
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

  test('omits the links a dataset lacks', () => {
    render(<DatasetsTable rows={rows} />);

    // No docs URL and no Butler config.
    const row = within(getRow('prompt'));
    expect(row.getAllByRole('link')).toHaveLength(1);
    expect(
      row.getByRole('link', { name: 'prompt ObsCore config' })
    ).toBeInTheDocument();
  });

  test('says so for a dataset with no description, links, or services', () => {
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
    expect(
      row.getByText(
        'Service discovery describes nothing more about this dataset.'
      )
    ).toBeInTheDocument();
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
