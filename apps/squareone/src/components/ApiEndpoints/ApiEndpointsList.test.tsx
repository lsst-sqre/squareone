import { render, screen, within } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

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
        ivoaUrl: 'https://www.ivoa.net/documents/TAP/',
        ivoaName: 'TAP',
        requiredScopes: ['read:tap'],
      },
      {
        label: 'DataLink',
        url: 'https://data.lsst.cloud/api/datalink',
        ivoaUrl: null,
        ivoaName: null,
        requiredScopes: [],
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

  test('renders a curated endpoint name as plain text with a spec-named IVOA doc link', () => {
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

  test('renders an endpoint label with no IVOA link as plain text', () => {
    render(<ApiEndpointsList groups={groups} />);

    expect(
      screen.queryByRole('link', { name: 'DataLink' })
    ).not.toBeInTheDocument();
    expect(screen.getByText('DataLink')).toBeInTheDocument();
  });

  test('links a non-IVOA docs url with a generic, endpoint-named docs label', () => {
    render(
      <ApiEndpointsList
        groups={[
          {
            ...groups[0],
            endpoints: [
              {
                label: 'Alert retrieval',
                url: 'https://data.lsst.cloud/api/alerts',
                ivoaUrl: null,
                ivoaName: null,
                docsUrl: 'https://sqr-114.lsst.io/',
                requiredScopes: [],
              },
            ],
          },
        ]}
      />
    );

    expect(
      screen.getByRole('link', { name: 'Alert retrieval docs' })
    ).toHaveAttribute('href', 'https://sqr-114.lsst.io/');
    expect(screen.queryByRole('link', { name: /ivoa/i })).toBeNull();
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
                requiredScopes: ['read:image', 'read:tap'],
              },
            ],
          },
        ]}
      />
    );

    const link = screen.getByRole('link', {
      name: 'Create a token with these scopes for Simple Image Access (SIA v2)',
    });
    expect(link).toHaveTextContent('Create a token with these scopes');
    expect(link).toHaveAttribute(
      'href',
      '/settings/tokens/new?scopes=read%3Aimage%2Cread%3Atap'
    );
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
