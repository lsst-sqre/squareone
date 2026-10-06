import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import type { ServiceLinkResult } from '../../lib/serviceLink/types';
import ServiceLink from './ServiceLink';

const okResult: ServiceLinkResult = {
  status: 'ok',
  url: 'https://id-dev.lsst.cloud/',
};

// Every outcome that renders no link: no repertoireUrl, discovery failed, and
// the service absent from discovery.
const fallbackResults: ServiceLinkResult[] = [
  { status: 'omitted' },
  { status: 'unavailable' },
  { status: 'missing' },
];

describe('ServiceLink', () => {
  test('self-closing, links to the URL with the URL (no trailing slash) as its text', () => {
    render(<ServiceLink result={okResult} />);

    const link = screen.getByRole('link', {
      name: 'https://id-dev.lsst.cloud',
    });
    expect(link).toHaveAttribute('href', 'https://id-dev.lsst.cloud/');
  });

  test('with children, uses the children as the link text', () => {
    render(<ServiceLink result={okResult}>Account settings</ServiceLink>);

    const link = screen.getByRole('link', { name: 'Account settings' });
    expect(link).toHaveAttribute('href', 'https://id-dev.lsst.cloud/');
  });

  test.each(fallbackResults)(
    'when $status, renders the children as plain text with no link',
    (result) => {
      const { container } = render(
        <p>
          Visit <ServiceLink result={result}>account settings</ServiceLink>.
        </p>
      );

      expect(screen.queryByRole('link')).not.toBeInTheDocument();
      expect(container).toHaveTextContent('Visit account settings.');
    }
  );

  test.each(fallbackResults)(
    'when $status and self-closing, renders nothing',
    (result) => {
      const { container } = render(<ServiceLink result={result} />);

      expect(container).toBeEmptyDOMElement();
    }
  );

  test('with variant="cta", renders a call-to-action link', () => {
    render(
      <ServiceLink result={okResult} variant="cta">
        Manage account settings
      </ServiceLink>
    );

    const link = screen.getByRole('link', {
      name: 'Manage account settings',
    });
    expect(link).toHaveAttribute('href', 'https://id-dev.lsst.cloud/');
    expect(link.className).toMatch(/ctaLink/);
  });

  test.each(fallbackResults)(
    'with variant="cta", renders nothing when $status, even with children',
    (result) => {
      const { container } = render(
        <ServiceLink result={result} variant="cta">
          Manage account settings
        </ServiceLink>
      );

      expect(container).toBeEmptyDOMElement();
    }
  );
});
