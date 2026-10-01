import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import DocsIconLink from './DocsIconLink';

describe('DocsIconLink', () => {
  test('renders an icon-only link named and titled by its label', () => {
    render(
      <DocsIconLink
        href="https://www.ivoa.net/documents/TAP/"
        label="IVOA TAP docs"
      />
    );

    const link = screen.getByRole('link', { name: 'IVOA TAP docs' });
    expect(link).toHaveAttribute('href', 'https://www.ivoa.net/documents/TAP/');
    expect(link).toHaveAttribute('title', 'IVOA TAP docs');
    expect(link).toHaveTextContent('');
    expect(link.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });
});
