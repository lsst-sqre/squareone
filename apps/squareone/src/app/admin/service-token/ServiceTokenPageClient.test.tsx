import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, test } from 'vitest';

import ServiceTokenPageClient from './ServiceTokenPageClient';

describe('ServiceTokenPageClient', () => {
  test('renders the page heading', () => {
    render(<ServiceTokenPageClient />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Service tokens' })
    ).toBeInTheDocument();
  });

  test('renders a placeholder section for creating a service token', () => {
    render(<ServiceTokenPageClient />);

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /create a service token/i,
      })
    ).toBeInTheDocument();
  });

  test('renders a placeholder section for managing existing tokens', () => {
    render(<ServiceTokenPageClient />);

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /manage existing tokens/i,
      })
    ).toBeInTheDocument();
  });
});
