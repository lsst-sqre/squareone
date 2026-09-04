import type { OIDCClientWithSecret } from '@lsst-sqre/gafaelfawr-client';
import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import OIDCClientCreated from './OIDCClientCreated';

const client: OIDCClientWithSecret = {
  client_id: 'a1b2c3d4-0000-4000-8000-000000000009',
  client_secret: 'dev-oidc-secret-0001-xxxxxxxxxxxxxxxxxxxxxxxx',
  return_uri: 'https://app.example.org/oauth/callback',
  description: 'Example relying party',
  notes: null,
  url: null,
  last_modified_by: 'vera',
  created: '2026-08-25T12:00:00Z',
  last_modified: '2026-08-25T12:00:00Z',
};

describe('OIDCClientCreated', () => {
  test('shows the client id and the one-time secret', () => {
    render(<OIDCClientCreated client={client} />);

    expect(screen.getByText(client.client_id)).toBeInTheDocument();
    expect(screen.getByText(client.client_secret)).toBeInTheDocument();
  });

  test('offers a copy button for each credential', () => {
    render(<OIDCClientCreated client={client} />);

    expect(
      screen.getByRole('button', { name: /copy client id to clipboard/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /copy client secret to clipboard/i })
    ).toBeInTheDocument();
  });

  test('warns that the secret will never be shown again', () => {
    // The API has no rotate endpoint, so this warning is the only thing
    // standing between the operator and a client they have to delete and
    // re-register.
    render(<OIDCClientCreated client={client} />);

    expect(
      screen.getByText(/only time gafaelfawr will show it/i)
    ).toBeInTheDocument();
  });

  test('links to the client detail page and back to the listing', () => {
    render(<OIDCClientCreated client={client} />);

    expect(
      screen.getByRole('link', { name: /view this client/i })
    ).toHaveAttribute('href', `/admin/oidc-clients/${client.client_id}`);
    expect(
      screen.getByRole('link', { name: /back to all clients/i })
    ).toHaveAttribute('href', '/admin/oidc-clients');
  });

  test('escapes a client id that is not URL-safe in the detail link', () => {
    render(<OIDCClientCreated client={{ ...client, client_id: 'a b/c' }} />);

    expect(
      screen.getByRole('link', { name: /view this client/i })
    ).toHaveAttribute('href', '/admin/oidc-clients/a%20b%2Fc');
  });

  test('names the client being confirmed', () => {
    render(<OIDCClientCreated client={client} />);

    expect(
      screen.getByRole('heading', { name: /registered example relying party/i })
    ).toBeInTheDocument();
  });
});
