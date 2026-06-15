import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import type { ApiEndpointsResult } from '../../lib/apiEndpoints/types';
import ApiEndpoints from './ApiEndpoints';

const okResult: ApiEndpointsResult = {
  status: 'ok',
  groups: [
    {
      datasetKey: 'dp1',
      displayName: 'Data Preview 1',
      docsUrl: 'https://dp1.lsst.io',
      description: 'Commissioning data.',
      endpoints: [
        {
          label: 'Table Access Protocol (TAP)',
          url: 'https://example.org/api/tap',
          ivoaUrl: 'https://www.ivoa.net/documents/TAP/',
        },
      ],
    },
  ],
};

describe('ApiEndpoints', () => {
  test('renders nothing when the listing is omitted', () => {
    const { container } = render(
      <ApiEndpoints result={{ status: 'omitted' }} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  test('renders a temporarily-unavailable notice when discovery failed', () => {
    render(<ApiEndpoints result={{ status: 'unavailable' }} />);

    expect(screen.getByText(/temporarily unavailable/i)).toBeInTheDocument();
  });

  test('renders the endpoint list when discovery succeeded', () => {
    render(<ApiEndpoints result={okResult} />);

    expect(
      screen.getByRole('heading', { name: 'Data Preview 1' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'https://example.org/api/tap' })
    ).toBeInTheDocument();
  });

  test('forwards headingLevel through to the listing', () => {
    render(<ApiEndpoints result={okResult} headingLevel={4} />);

    expect(
      screen.getByRole('heading', { level: 4, name: 'Data Preview 1' })
    ).toBeInTheDocument();
  });
});
