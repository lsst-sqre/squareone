import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, test, vi } from 'vitest';

import ServiceTokenPageClient from './ServiceTokenPageClient';

// Render next/link as a plain anchor so the "Create a service token" link's
// href can be asserted.
vi.mock('next/link', () => ({
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

describe('ServiceTokenPageClient', () => {
  test('renders the page heading and intro', () => {
    render(<ServiceTokenPageClient />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Service tokens' })
    ).toBeInTheDocument();
  });

  test('renders a Create a service token link to the /new page', () => {
    render(<ServiceTokenPageClient />);

    const link = screen.getByRole('link', { name: 'Create a service token' });
    expect(link).toHaveAttribute('href', '/admin/service-tokens/new');
  });

  test('renders the manage-existing-tokens lookup section', () => {
    render(<ServiceTokenPageClient />);

    expect(
      screen.getByRole('heading', { level: 2, name: /manage existing tokens/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Bot user')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /look up tokens/i })
    ).toBeInTheDocument();
  });

  test('does not render the creation form', () => {
    render(<ServiceTokenPageClient />);

    // The creation form (its bot-username field and submit button) lives on the
    // /new page now, not the landing page.
    expect(screen.queryByLabelText(/bot username/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /create service token/i })
    ).not.toBeInTheDocument();
  });
});
