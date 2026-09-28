import {
  getEmptyDiscovery,
  type ServiceDiscovery,
} from '@lsst-sqre/repertoire-client';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import { serviceDiscoveryToApiEndpointGroups } from '../../lib/apiEndpoints/transform';
import type { ApiEndpointGroup } from '../../lib/apiEndpoints/types';
import ApiEndpointsList from './ApiEndpointsList';

const groups: ApiEndpointGroup[] = [
  {
    datasetKey: 'dp1',
    displayName: 'Data Preview 1',
    docsUrl: 'https://dp1.lsst.io',
    description: 'Data Preview 1 contains commissioning data.',
    endpoints: [
      {
        label: 'Table Access Protocol (TAP)',
        url: 'https://data.lsst.cloud/api/tap',
        docs: {
          url: 'https://www.ivoa.net/documents/TAP/',
          label: 'IVOA TAP docs',
        },
        requiredScopes: ['read:tap'],
      },
      {
        label: 'DataLink',
        url: 'https://data.lsst.cloud/api/datalink',
        docs: null,
        requiredScopes: [],
      },
    ],
  },
];

// The same TAP service listed under two datasets, as discovery publishes it:
// the generic label is shared, so only the dataset tells the rows apart.
const tapGroups: ApiEndpointGroup[] = [
  groups[0],
  {
    datasetKey: 'dp02',
    displayName: 'Data Preview 0.2',
    docsUrl: 'https://dp0-2.lsst.io',
    description: null,
    endpoints: [
      {
        label: 'Table Access Protocol (TAP)',
        url: 'https://data.lsst.cloud/api/tap',
        docs: null,
        requiredScopes: ['read:tap'],
      },
    ],
  },
];

/** The list item rendering the endpoint with the given label. */
function getEndpointItem(label: string): HTMLElement {
  const item = screen.getByText(label).closest('li');
  if (!item) {
    throw new Error(`No list item for endpoint ${label}`);
  }
  return item;
}

describe('ApiEndpointsList', () => {
  test('renders the dataset display name as the section heading', () => {
    render(<ApiEndpointsList groups={groups} />);

    expect(
      screen.getByRole('heading', { name: 'Data Preview 1' })
    ).toBeInTheDocument();
  });

  test('renders dataset headings at level 3 by default', () => {
    render(<ApiEndpointsList groups={groups} />);

    expect(
      screen.getByRole('heading', { level: 3, name: 'Data Preview 1' })
    ).toBeInTheDocument();
  });

  test('honors the headingLevel prop', () => {
    render(<ApiEndpointsList groups={groups} headingLevel={2} />);

    expect(
      screen.getByRole('heading', { level: 2, name: 'Data Preview 1' })
    ).toBeInTheDocument();
  });

  test('links the dataset heading to its docs url', () => {
    render(<ApiEndpointsList groups={groups} />);

    expect(
      screen.getByRole('link', { name: 'Data Preview 1' })
    ).toHaveAttribute('href', 'https://dp1.lsst.io');
  });

  test('renders the dataset description', () => {
    render(<ApiEndpointsList groups={groups} />);

    expect(
      screen.getByText('Data Preview 1 contains commissioning data.')
    ).toBeInTheDocument();
  });

  test('appends a "Read the documentation" link to the description', () => {
    render(<ApiEndpointsList groups={groups} />);

    expect(
      screen.getByRole('link', {
        name: 'Read the Data Preview 1 documentation',
      })
    ).toHaveAttribute('href', 'https://dp1.lsst.io');
  });

  test('omits the documentation link when the dataset has no docs url', () => {
    render(<ApiEndpointsList groups={[{ ...groups[0], docsUrl: null }]} />);

    expect(
      screen.queryByRole('link', { name: /read the .* documentation/i })
    ).not.toBeInTheDocument();
  });

  test('renders an endpoint name as plain text with its labelled docs link', () => {
    render(<ApiEndpointsList groups={groups} />);

    expect(
      screen.queryByRole('link', { name: 'Table Access Protocol (TAP)' })
    ).not.toBeInTheDocument();
    expect(screen.getByText('Table Access Protocol (TAP)')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'IVOA TAP docs' })).toHaveAttribute(
      'href',
      'https://www.ivoa.net/documents/TAP/'
    );
  });

  test('renders an endpoint with no docs link as plain text', () => {
    render(<ApiEndpointsList groups={groups} />);

    expect(
      screen.queryByRole('link', { name: 'DataLink' })
    ).not.toBeInTheDocument();
    expect(screen.getByText('DataLink')).toBeInTheDocument();
  });

  test('uses the docs label as the icon link tooltip', () => {
    render(
      <ApiEndpointsList
        groups={[
          {
            ...groups[0],
            endpoints: [
              {
                label: 'Alert retrieval',
                url: 'https://data.lsst.cloud/api/alerts',
                docs: {
                  url: 'https://sqr-114.lsst.io/',
                  label: 'Alert retrieval docs',
                },
                requiredScopes: [],
              },
            ],
          },
        ]}
      />
    );

    const link = screen.getByRole('link', { name: 'Alert retrieval docs' });
    expect(link).toHaveAttribute('href', 'https://sqr-114.lsst.io/');
    expect(link).toHaveAttribute('title', 'Alert retrieval docs');
  });

  test('renders each endpoint url as code text, not a link', () => {
    render(<ApiEndpointsList groups={groups} />);

    expect(
      screen.queryByRole('link', { name: 'https://data.lsst.cloud/api/tap' })
    ).not.toBeInTheDocument();
    expect(
      screen.getByText('https://data.lsst.cloud/api/tap')
    ).toBeInTheDocument();
  });

  test('renders a copy button for each endpoint', () => {
    render(<ApiEndpointsList groups={groups} />);

    expect(
      screen.getAllByRole('button', { name: /copy the .* endpoint url/i })
    ).toHaveLength(2);
  });

  test('names each copy button for its endpoint and dataset', () => {
    render(<ApiEndpointsList groups={tapGroups} />);

    const names = screen
      .getAllByRole('button', { name: /table access protocol/i })
      .map((button) => button.getAttribute('aria-label'));
    expect(names).toEqual([
      'Copy the Table Access Protocol (TAP) endpoint URL for Data Preview 1 to the clipboard',
      'Copy the Table Access Protocol (TAP) endpoint URL for Data Preview 0.2 to the clipboard',
    ]);
  });

  test('renders an endpoint required scopes as pills', () => {
    render(<ApiEndpointsList groups={groups} />);

    const tapItem = getEndpointItem('Table Access Protocol (TAP)');
    const scopes = within(tapItem).getByRole('list', {
      name: 'Required scopes',
    });
    expect(
      within(scopes)
        .getAllByRole('listitem')
        .map((item) => item.textContent)
    ).toEqual(['read:tap']);
  });

  test('links an endpoint with required scopes to a token form prefilled with them', () => {
    render(
      <ApiEndpointsList
        groups={[
          {
            ...groups[0],
            endpoints: [
              {
                label: 'Simple Image Access (SIA v2)',
                url: 'https://data.lsst.cloud/api/sia/dp1/query',
                docs: null,
                requiredScopes: ['read:image', 'read:tap'],
              },
            ],
          },
        ]}
      />
    );

    const link = screen.getByRole('link', {
      name: 'Create a token with these scopes for Simple Image Access (SIA v2) in Data Preview 1',
    });
    expect(link).toHaveTextContent('Create a token with these scopes');
    expect(link).toHaveAttribute(
      'href',
      '/settings/tokens/new?scopes=read%3Aimage%2Cread%3Atap'
    );
  });

  test('names each token link for its endpoint and dataset', () => {
    render(<ApiEndpointsList groups={tapGroups} />);

    const names = screen
      .getAllByRole('link', { name: /^create a token/i })
      .map((link) => link.getAttribute('aria-label'));
    expect(names).toEqual([
      'Create a token with these scopes for Table Access Protocol (TAP) in Data Preview 1',
      'Create a token with these scopes for Table Access Protocol (TAP) in Data Preview 0.2',
    ]);
  });

  test('renders a scope discovery repeats as one pill and one token link parameter', () => {
    const discovery = {
      ...getEmptyDiscovery(),
      datasets: {
        dp1: {
          services: {
            mystery: {
              url: 'https://data.lsst.cloud/api/mystery',
              title: 'Mystery service',
              versions: {},
              required_scopes: ['read:image', 'read:tap', 'read:image'],
            },
          },
        },
      },
    } as unknown as ServiceDiscovery;
    const consoleError = vi.spyOn(console, 'error');

    render(
      <ApiEndpointsList
        groups={serviceDiscoveryToApiEndpointGroups(discovery)}
      />
    );

    const scopes = within(getEndpointItem('Mystery service')).getByRole(
      'list',
      { name: 'Required scopes' }
    );
    expect(
      within(scopes)
        .getAllByRole('listitem')
        .map((item) => item.textContent)
    ).toEqual(['read:image', 'read:tap']);
    expect(
      screen.getByRole('link', {
        name: 'Create a token with these scopes for Mystery service in Data Preview 1',
      })
    ).toHaveAttribute(
      'href',
      '/settings/tokens/new?scopes=read%3Aimage%2Cread%3Atap'
    );
    // React reports duplicate list keys via console.error.
    expect(consoleError).not.toHaveBeenCalled();
  });

  test('shows no scope pills or token link for an endpoint without required scopes', () => {
    render(<ApiEndpointsList groups={groups} />);

    const datalinkItem = getEndpointItem('DataLink');
    expect(
      within(datalinkItem).queryByRole('list', { name: 'Required scopes' })
    ).not.toBeInTheDocument();
    expect(
      within(datalinkItem).queryByRole('link', { name: /create a token/i })
    ).not.toBeInTheDocument();
  });

  test('renders no group headings when given an empty list', () => {
    render(<ApiEndpointsList groups={[]} />);

    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });
});
