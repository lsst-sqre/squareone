import { mockDiscoveryDataDev } from '@lsst-sqre/repertoire-client';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';

import { buildApplicationRows } from '../../lib/admin/overview';
import ApplicationsTable from './ApplicationsTable';

const rows = buildApplicationRows(mockDiscoveryDataDev);

/** The table's body rows (every row but the header). */
function getBodyRows(): HTMLElement[] {
  const table = screen.getByRole('table', { name: 'Applications' });
  return within(table).getAllByRole('row').slice(1);
}

/** The application name in each body row, in display order. */
function getRowNames(): string[] {
  return getBodyRows().map(
    (row) => within(row).getAllByRole('cell')[0].textContent ?? ''
  );
}

/** The body row for the named application. */
function getRow(name: string): HTMLElement {
  const row = getBodyRows().find(
    (candidate) =>
      within(candidate).getAllByRole('cell')[0].textContent === name
  );
  if (!row) throw new Error(`No row for ${name}`);
  return row;
}

describe('ApplicationsTable', () => {
  test('lists every application, sorted by name', () => {
    render(<ApplicationsTable rows={rows} />);

    expect(getRowNames()).toEqual([...mockDiscoveryDataDev.applications]);
    expect(screen.getByText('41 applications')).toBeInTheDocument();
  });

  test('shows the title, kind, and both URLs of nublado', () => {
    render(<ApplicationsTable rows={rows} />);

    const row = within(getRow('nublado'));
    expect(row.getByText('Notebook aspect')).toBeInTheDocument();
    expect(row.getByText('UI + API')).toBeInTheDocument();
    expect(
      row.getByRole('link', { name: 'https://nb.data-dev.lsst.cloud/nb' })
    ).toHaveAttribute('href', 'https://nb.data-dev.lsst.cloud/nb');
    expect(
      row.getByRole('link', { name: 'https://data-dev.lsst.cloud/nublado' })
    ).toHaveAttribute('href', 'https://data-dev.lsst.cloud/nublado');
    expect(row.getByText('nublado-controller')).toBeInTheDocument();
  });

  test('links the docs and OpenAPI spec and lists the required scopes', () => {
    render(<ApplicationsTable rows={rows} />);

    const row = within(getRow('nublado'));
    expect(
      row.getByRole('link', { name: 'nublado documentation' })
    ).toHaveAttribute('href', 'https://nublado.lsst.io/');
    expect(
      row.getByRole('link', { name: 'nublado OpenAPI specification' })
    ).toHaveAttribute(
      'href',
      'https://data-dev.lsst.cloud/nublado/openapi.json'
    );
    const scopes = row.getByRole('list', { name: 'Required scopes' });
    expect(
      within(scopes)
        .getAllByRole('listitem')
        .map((item) => item.textContent)
    ).toEqual(['exec:notebook', 'admin:jupyterlab']);
  });

  test('shows an application with no matching service by name only', () => {
    render(<ApplicationsTable rows={rows} />);

    const row = getRow('cert-manager');
    expect(within(row).queryByRole('link')).not.toBeInTheDocument();
    expect(within(row).queryByRole('list')).not.toBeInTheDocument();
    expect(within(row).getAllByText('—')).toHaveLength(2);
  });

  test('sorts by a column when its header is clicked', async () => {
    const user = userEvent.setup();
    render(<ApplicationsTable rows={rows} />);

    await user.click(screen.getByRole('button', { name: 'Application' }));
    expect(getRowNames()[0]).toBe('wobbly');

    await user.click(screen.getByRole('button', { name: 'Kind' }));
    const kinds = getBodyRows().map(
      (row) => within(row).getAllByRole('cell')[2].textContent
    );
    expect(kinds.slice(0, 3)).toEqual(['API', 'API', 'API']);
    expect(kinds.at(-1)).toBe('—');
  });

  test('narrows the rows to names matching the filter', async () => {
    const user = userEvent.setup();
    render(<ApplicationsTable rows={rows} />);

    await user.type(
      screen.getByRole('searchbox', { name: 'Filter applications' }),
      'strimzi'
    );

    expect(getRowNames()).toEqual([
      'strimzi',
      'strimzi-access-operator',
      'strimzi-registry-operator',
    ]);
    expect(screen.getByText('3 of 41 applications')).toBeInTheDocument();
  });

  test('narrows the rows to titles matching the filter', async () => {
    const user = userEvent.setup();
    render(<ApplicationsTable rows={rows} />);

    await user.type(
      screen.getByRole('searchbox', { name: 'Filter applications' }),
      'portal aspect'
    );

    expect(getRowNames()).toEqual(['portal']);
  });

  test('says so when no application matches the filter', async () => {
    const user = userEvent.setup();
    render(<ApplicationsTable rows={rows} />);

    await user.type(
      screen.getByRole('searchbox', { name: 'Filter applications' }),
      'no-such-app'
    );

    expect(
      screen.getByText(/no applications match “no-such-app”/i)
    ).toBeInTheDocument();
  });
});
