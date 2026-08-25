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
  test('renders a primary and an identifiers row for each client', () => {
    render(<OIDCClientsTable clients={clients} />);

    const table = screen.getByRole('table');
    // One header row plus a primary and a detail row per client.
    expect(within(table).getAllByRole('row')).toHaveLength(
      clients.length * 2 + 1
    );

    expect(screen.getByText('Chronograf dashboards')).toBeInTheDocument();
    expect(screen.getByText('vera')).toBeInTheDocument();
  });

  test('carries each client’s identifiers beneath its primary row', () => {
    // client_id and return_uri are long, opaque, and copy-pasted rather than
    // scanned, so they sit in a labeled full-width row rather than columns.
    render(<OIDCClientsTable clients={clients} />);

    expect(screen.getAllByText('Client ID')).toHaveLength(clients.length);
    expect(
      screen.getByText('a1b2c3d4-0000-4000-8000-000000000001')
    ).toBeInTheDocument();
    expect(screen.getAllByText('Return URI')).toHaveLength(clients.length);
    expect(
      screen.getByText('https://chronograf.example.org/oauth/callback')
    ).toBeInTheDocument();
  });

  test('links each description to that client’s detail route', () => {
    render(<OIDCClientsTable clients={clients} />);

    expect(
      screen.getByRole('link', { name: 'Chronograf dashboards' })
    ).toHaveAttribute(
      'href',
      '/admin/oidc-clients/a1b2c3d4-0000-4000-8000-000000000001'
    );
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
