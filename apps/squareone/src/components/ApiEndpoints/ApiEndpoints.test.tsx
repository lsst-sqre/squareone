import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import type { ApiEndpointsResult } from '../../lib/apiEndpoints/types';
import ApiEndpoints from './ApiEndpoints';

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
    const result: ApiEndpointsResult = {
      status: 'ok',
      groups: [
        {
          datasetKey: 'dp1',
          endpoints: [{ label: 'tap', url: 'https://example.org/api/tap' }],
        },
      ],
    };

    render(<ApiEndpoints result={result} />);

    expect(screen.getByRole('heading', { name: 'dp1' })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'https://example.org/api/tap' })
    ).toBeInTheDocument();
  });
});
