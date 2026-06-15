import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import type { ApiEndpointGroup } from '../../lib/apiEndpoints/types';
import ApiEndpointsList from './ApiEndpointsList';

const groups: ApiEndpointGroup[] = [
  {
    datasetKey: 'dp1',
    endpoints: [
      { label: 'tap', url: 'https://data.lsst.cloud/api/tap' },
      { label: 'datalink', url: 'https://data.lsst.cloud/api/datalink' },
    ],
  },
  {
    datasetKey: 'dp02',
    endpoints: [{ label: 'tap', url: 'https://data.lsst.cloud/api/tap' }],
  },
];

describe('ApiEndpointsList', () => {
  test('renders a heading for each dataset group', () => {
    render(<ApiEndpointsList groups={groups} />);

    expect(screen.getByRole('heading', { name: 'dp1' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'dp02' })).toBeInTheDocument();
  });

  test('renders each endpoint as a link to its url', () => {
    render(<ApiEndpointsList groups={groups} />);

    const datalink = screen.getByRole('link', {
      name: 'https://data.lsst.cloud/api/datalink',
    });
    expect(datalink).toHaveAttribute(
      'href',
      'https://data.lsst.cloud/api/datalink'
    );
  });

  test('shows the raw service name as the endpoint label', () => {
    render(<ApiEndpointsList groups={groups} />);

    // Only dp1 exposes a `datalink` service, so its label appears exactly once.
    expect(screen.getAllByText('datalink')).toHaveLength(1);
  });

  test('renders no group headings when given an empty list', () => {
    render(<ApiEndpointsList groups={[]} />);

    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });
});
