import { mockDiscoveryDataDev } from '@lsst-sqre/repertoire-client';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';

import { buildApplicationRows } from '../../lib/admin/overview';
import ApplicationsTable from './ApplicationsTable';

const rows = buildApplicationRows(mockDiscoveryDataDev);

/**
 * Each application's unit in the table: the `<tbody>` holding its name row
 * and the detail row beneath it (every row group but the header's).
 */
function getRowGroups(): HTMLElement[] {
  const table = screen.getByRole('table', { name: 'Applications' });
  return within(table).getAllByRole('rowgroup').slice(1);
}

/** The application name in each row group, in display order. */
function getRowNames(): string[] {
  return getRowGroups().map(
    (group) => within(group).getAllByRole('cell')[0].textContent ?? ''
  );
}

/** The row group for the named application. */
function getRow(name: string): HTMLElement {
  const group = getRowGroups().find(
    (candidate) =>
      within(candidate).getAllByRole('cell')[0].textContent === name
  );
  if (!group) throw new Error(`No row for ${name}`);
  return group;
}

describe('ApplicationsTable', () => {
  test('lists every application, sorted by name', () => {
    render(<ApplicationsTable rows={rows} />);

    expect(getRowNames()).toEqual([...mockDiscoveryDataDev.applications]);
    expect(screen.getByText('41 applications')).toBeInTheDocument();
  });

  test('has only the name column, with the rest in a detail row', () => {
    render(<ApplicationsTable rows={rows} />);

    expect(screen.getAllByRole('columnheader')).toHaveLength(1);
    const [nameRow, detailRow] = within(getRow('nublado')).getAllByRole('row');
    expect(nameRow).toHaveTextContent(/^nublado$/);
    expect(detailRow).toHaveTextContent('Notebook aspect');
  });

  test('shows the title and both services of nublado, each with its scopes', () => {
    render(<ApplicationsTable rows={rows} />);

    const row = within(getRow('nublado'));
    expect(row.getByText('Notebook aspect')).toBeInTheDocument();
    expect(
      row.getByRole('link', { name: 'https://nb.data-dev.lsst.cloud/nb' })
    ).toHaveAttribute('href', 'https://nb.data-dev.lsst.cloud/nb');
    expect(
      row.getByRole('link', { name: 'https://data-dev.lsst.cloud/nublado' })
    ).toHaveAttribute('href', 'https://data-dev.lsst.cloud/nublado');
    expect(row.getByText('nublado-controller')).toBeInTheDocument();
    expect(
      within(row.getByRole('list', { name: 'nublado required scopes' }))
        .getAllByRole('listitem')
        .map((item) => item.textContent)
    ).toEqual(['exec:notebook']);
    expect(
      within(
        row.getByRole('list', { name: 'nublado-controller required scopes' })
      )
        .getAllByRole('listitem')
        .map((item) => item.textContent)
    ).toEqual(['admin:jupyterlab']);
  });

  test('links the docs and OpenAPI spec', () => {
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
  });

  test('says so for an application with no matching service', () => {
    render(<ApplicationsTable rows={rows} />);

    const row = within(getRow('cert-manager'));
    expect(row.queryByRole('link')).not.toBeInTheDocument();
    expect(row.queryByRole('list')).not.toBeInTheDocument();
    expect(
      row.getByText('No UI or API service in service discovery.')
    ).toBeInTheDocument();
  });

  test('sorts by name when the header is clicked', async () => {
    const user = userEvent.setup();
    render(<ApplicationsTable rows={rows} />);

    await user.click(screen.getByRole('button', { name: 'Application' }));
    expect(getRowNames()[0]).toBe('wobbly');
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
