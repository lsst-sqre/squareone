import type { OIDCClient } from '@lsst-sqre/gafaelfawr-client';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import OIDCClientsTable from './OIDCClientsTable';

const clients: OIDCClient[] = [
  {
    client_id: 'a1b2c3d4-0000-4000-8000-000000000001',
    return_uri: 'https://chronograf.example.org/oauth/callback',
    description: 'Chronograf dashboards',
    notes: 'Owned by the SQuaRE team.',
    url: 'https://chronograf.example.org/',
    last_modified_by: 'vera',
    created: '2026-01-14T09:30:00Z',
    last_modified: '2026-03-02T16:45:00Z',
  },
  {
    client_id: 'a1b2c3d4-0000-4000-8000-000000000002',
    return_uri: 'https://argocd.example.org/auth/callback',
    description: 'Argo CD',
    notes: null,
    url: null,
    last_modified_by: 'rubin',
    created: '2026-02-20T11:05:00Z',
    last_modified: '2026-02-20T11:05:00Z',
  },
];

describe('OIDCClientsTable', () => {
  test('columns are exactly the client id and when it last changed', () => {
    render(<OIDCClientsTable clients={clients} />);

    const table = screen.getByRole('table');
    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((header) => header.textContent)
    ).toEqual(['Client ID', 'Last modified']);
    // The description moved to the addendum row and the last modifier is not
    // worth a column of its own.
    expect(screen.queryByText('vera')).not.toBeInTheDocument();
  });

  test('renders a primary and an addendum row for each client', () => {
    render(<OIDCClientsTable clients={clients} />);

    const table = screen.getByRole('table');
    // One header row plus a primary and an addendum row per client.
    expect(within(table).getAllByRole('row')).toHaveLength(
      clients.length * 2 + 1
    );
  });

  test('links each client id to that client’s detail route', () => {
    render(<OIDCClientsTable clients={clients} />);

    expect(
      screen.getByRole('link', { name: 'a1b2c3d4-0000-4000-8000-000000000001' })
    ).toHaveAttribute(
      'href',
      '/admin/oidc-clients/a1b2c3d4-0000-4000-8000-000000000001'
    );
    // The description is prose in the addendum row, not a second link.
    expect(
      screen.queryByRole('link', { name: 'Chronograf dashboards' })
    ).not.toBeInTheDocument();
  });

  test('carries the description and return URI as unlabelled prose beneath the row', () => {
    render(<OIDCClientsTable clients={clients} />);

    expect(screen.getByText('Chronograf dashboards')).toBeInTheDocument();
    expect(
      screen.getByText('https://chronograf.example.org/oauth/callback')
    ).toBeInTheDocument();
    // No key/value labels: the only "Client ID" on the page is the column
    // header, and nothing labels the return URI.
    expect(screen.getAllByText('Client ID')).toHaveLength(1);
    expect(screen.queryByText('Return URI')).not.toBeInTheDocument();
    expect(screen.queryByText(/^Description/)).not.toBeInTheDocument();
  });

  test('formats last modified as a stable UTC timestamp', () => {
    render(<OIDCClientsTable clients={clients} />);

    expect(screen.getByText('2026-03-02 16:45 UTC')).toBeInTheDocument();
  });

  test('offers a New client button linking to the create route', () => {
    render(<OIDCClientsTable clients={clients} />);

    expect(screen.getByRole('link', { name: /new client/i })).toHaveAttribute(
      'href',
      '/admin/oidc-clients/new'
    );
  });

  test('shows an empty state, and still offers New client, with no clients', () => {
    render(<OIDCClientsTable clients={[]} />);

    expect(
      screen.getByText(/no openid connect clients are registered/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /new client/i })).toBeVisible();
  });
});
