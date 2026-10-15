import {
  mockDiscovery2x,
  mockDiscoveryDataDev,
} from '@lsst-sqre/repertoire-client';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';

import { buildServiceRows, type ServiceRow } from '../../lib/admin/overview';
import ServicesTable from './ServicesTable';

const rows = buildServiceRows(mockDiscoveryDataDev);

/**
 * Each service's unit in the table: the `<tbody>` holding its name row and
 * the detail row beneath it (every row group but the header's).
 */
function getRowGroups(): HTMLElement[] {
  const table = screen.getByRole('table', { name: 'Services' });
  return within(table).getAllByRole('rowgroup').slice(1);
}

/** The service name in each row group, in display order. */
function getRowNames(): string[] {
  return getRowGroups().map(
    (group) => within(group).getAllByRole('cell')[0].textContent ?? ''
  );
}

/** The kind in each row group, in display order. */
function getRowKinds(): string[] {
  return getRowGroups().map(
    (group) => within(group).getAllByRole('cell')[1].textContent ?? ''
  );
}

/** The row group for the named service. */
function getRow(name: string): HTMLElement {
  const group = getRowGroups().find(
    (candidate) =>
      within(candidate).getAllByRole('cell')[0].textContent === name
  );
  if (!group) throw new Error(`No row for ${name}`);
  return group;
}

/** The detail row (the second row) of the named service's row group. */
function getDetailRow(name: string): HTMLElement {
  return within(getRow(name)).getAllByRole('row')[1];
}

describe('ServicesTable', () => {
  test('lists every service, sorted by name, with a count', () => {
    render(<ServicesTable rows={rows} />);

    expect(getRowNames()).toEqual([
      'argocd',
      'chronograf',
      'comanage',
      'datalink',
      'gafaelfawr',
      'kafdrop',
      'login',
      'logout',
      'mobu',
      'muster',
      'noteburst',
      'nublado',
      'nublado-controller',
      'portal',
      'repertoire',
      'semaphore',
      'settings',
      'squareone',
      'times-square',
      'webdav',
      'wobbly',
    ]);
    expect(screen.getByText('21 services')).toBeInTheDocument();
  });

  test('has Service and Kind columns, with the rest in a detail row', () => {
    render(<ServicesTable rows={rows} />);

    expect(
      screen.getAllByRole('columnheader').map((header) => header.textContent)
    ).toEqual(['Service', 'Kind']);
    const [primary, detail] = within(getRow('nublado')).getAllByRole('row');
    expect(
      within(primary)
        .getAllByRole('cell')
        .map((cell) => cell.textContent)
    ).toEqual(['nublado', 'UI']);
    expect(detail).toHaveTextContent('Notebook aspect');
  });

  test('lists 10 UI and 11 API services', () => {
    render(<ServicesTable rows={rows} />);

    const kinds = getRowKinds();
    expect(kinds.filter((kind) => kind === 'UI')).toHaveLength(10);
    expect(kinds.filter((kind) => kind === 'API')).toHaveLength(11);
    for (const name of ['comanage', 'logout', 'settings', 'webdav']) {
      expect(
        within(within(getRow(name)).getAllByRole('row')[0]).getByText('UI')
      ).toBeInTheDocument();
    }
  });

  test('shows the URL, scopes, and OpenAPI spec of nublado-controller', () => {
    render(<ServicesTable rows={rows} />);

    const detail = within(getDetailRow('nublado-controller'));
    expect(
      detail.getByRole('link', { name: 'https://data-dev.lsst.cloud/nublado' })
    ).toHaveAttribute('href', 'https://data-dev.lsst.cloud/nublado');
    expect(
      within(
        detail.getByRole('list', { name: 'nublado-controller required scopes' })
      )
        .getAllByRole('listitem')
        .map((item) => item.textContent)
    ).toEqual(['admin:jupyterlab']);
    expect(
      detail.getByRole('link', {
        name: 'nublado-controller OpenAPI specification',
      })
    ).toHaveAttribute(
      'href',
      'https://data-dev.lsst.cloud/nublado/openapi.json'
    );
    expect(
      detail.queryByRole('link', { name: /documentation/ })
    ).not.toBeInTheDocument();
  });

  test('shows the title and docs link of a UI service, with no OpenAPI link', () => {
    render(<ServicesTable rows={rows} />);

    const detail = within(getDetailRow('nublado'));
    expect(detail.getByText('Notebook aspect')).toBeInTheDocument();
    expect(
      detail.getByRole('link', { name: 'https://nb.data-dev.lsst.cloud/nb' })
    ).toBeInTheDocument();
    expect(
      within(detail.getByRole('list', { name: 'nublado required scopes' }))
        .getAllByRole('listitem')
        .map((item) => item.textContent)
    ).toEqual(['exec:notebook']);
    expect(
      detail.getByRole('link', { name: 'nublado documentation' })
    ).toHaveAttribute('href', 'https://nublado.lsst.io/');
    expect(
      detail.queryByRole('link', { name: /OpenAPI/ })
    ).not.toBeInTheDocument();
  });

  test('shows just the URL of each service in a 2.x-shaped document', () => {
    // Repertoire 2.x publishes no titles, scopes, or docs URLs; drop the
    // OpenAPI specs too, so discovery describes no service beyond its URL.
    const bare = buildServiceRows(mockDiscovery2x).map(
      (row): ServiceRow => ({
        ...row,
        openapiUrl: null,
      })
    );
    render(<ServicesTable rows={bare} />);

    expect(screen.getByText('19 services')).toBeInTheDocument();
    for (const row of bare) {
      const detail = getDetailRow(row.name);
      expect(detail.textContent).toBe(row.url);
      expect(within(detail).getByRole('link')).toHaveAttribute('href', row.url);
      expect(within(detail).queryByRole('list')).not.toBeInTheDocument();
    }
  });

  test('sorts by service name when the Service header is clicked', async () => {
    const user = userEvent.setup();
    render(<ServicesTable rows={rows} />);

    await user.click(screen.getByRole('button', { name: 'Service' }));
    expect(getRowNames()[0]).toBe('wobbly');
  });

  test('sorts by kind when the Kind header is clicked', async () => {
    const user = userEvent.setup();
    render(<ServicesTable rows={rows} />);

    await user.click(screen.getByRole('button', { name: 'Kind' }));
    const kinds = getRowKinds();
    expect(kinds).toEqual([...kinds].sort());
    expect(kinds[0]).toBe('API');

    await user.click(screen.getByRole('button', { name: 'Kind' }));
    expect(getRowKinds()[0]).toBe('UI');
  });

  test('narrows the rows to names matching the filter and counts them', async () => {
    const user = userEvent.setup();
    render(<ServicesTable rows={rows} />);

    await user.type(
      screen.getByRole('searchbox', { name: 'Filter services' }),
      'nublado'
    );

    expect(getRowNames()).toEqual(['nublado', 'nublado-controller']);
    const count = screen.getByText('2 of 21 services');
    expect(count).toHaveAttribute('aria-live', 'polite');
  });

  test('narrows the rows to titles matching the filter', async () => {
    const user = userEvent.setup();
    render(<ServicesTable rows={rows} />);

    await user.type(
      screen.getByRole('searchbox', { name: 'Filter services' }),
      'user'
    );

    expect(getRowNames()).toEqual(['login', 'logout', 'settings']);
    expect(screen.getByText('3 of 21 services')).toBeInTheDocument();
  });

  test('restores every row when the filter is cleared', async () => {
    const user = userEvent.setup();
    render(<ServicesTable rows={rows} />);

    const filter = screen.getByRole('searchbox', { name: 'Filter services' });
    await user.type(filter, 'tap');
    await user.clear(filter);

    expect(getRowNames()).toHaveLength(21);
    expect(screen.getByText('21 services')).toBeInTheDocument();
  });

  test('says so when no service matches the filter', async () => {
    const user = userEvent.setup();
    render(<ServicesTable rows={rows} />);

    await user.type(
      screen.getByRole('searchbox', { name: 'Filter services' }),
      'no-such-service'
    );

    expect(
      screen.getByText('No services match “no-such-service”.')
    ).toBeInTheDocument();
    expect(screen.getByText('0 of 21 services')).toBeInTheDocument();
  });

  test('says so, with no table or filter, when discovery lists no services', () => {
    render(<ServicesTable rows={[]} />);

    const region = screen.getByRole('region', { name: 'Services' });
    expect(
      within(region).getByText('Service discovery lists no services.')
    ).toBeInTheDocument();
    expect(within(region).queryByRole('table')).not.toBeInTheDocument();
    expect(within(region).queryByRole('searchbox')).not.toBeInTheDocument();
  });
});
