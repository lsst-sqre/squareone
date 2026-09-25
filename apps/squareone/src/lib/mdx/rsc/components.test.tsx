import { render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

// Mock the RSC config loader so each test sets the configured repertoireUrl.
vi.mock('../../config/rsc', () => ({
  getStaticConfig: vi.fn(),
}));

// Mock only fetchServiceDiscovery; keep the real mock data from the client.
vi.mock('@lsst-sqre/repertoire-client', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@lsst-sqre/repertoire-client')>();
  return {
    ...actual,
    fetchServiceDiscovery: vi.fn(),
  };
});

import {
  fetchServiceDiscovery,
  mockDiscovery,
} from '@lsst-sqre/repertoire-client';

import { getStaticConfig } from '../../config/rsc';
import { commonMdxComponents, footerMdxComponents } from './components';

/**
 * Render the registered `<ServiceLink>` tag as MDX would, awaiting the async
 * server component to its element first (React Testing Library renders client
 * trees only).
 */
async function renderServiceLinkTag(props: Record<string, unknown>) {
  const ServiceLinkTag = commonMdxComponents.ServiceLink as (
    tagProps: Record<string, unknown>
  ) => Promise<ReactElement>;
  return render(await ServiceLinkTag(props));
}

describe('RSC MDX components: <ServiceLink>', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getStaticConfig).mockResolvedValue({
      repertoireUrl: 'https://example.org/repertoire',
    } as Awaited<ReturnType<typeof getStaticConfig>>);
    vi.mocked(fetchServiceDiscovery).mockResolvedValue(mockDiscovery);
  });

  test('self-closing, links to the discovered URL with it as the link text', async () => {
    await renderServiceLinkTag({ service: 'comanage' });

    const link = screen.getByRole('link', { name: 'https://id.lsst.cloud' });
    expect(link).toHaveAttribute('href', 'https://id.lsst.cloud/');
    expect(fetchServiceDiscovery).toHaveBeenCalledWith(
      'https://example.org/repertoire',
      expect.anything()
    );
  });

  test('passes the children and variant through to the link', async () => {
    await renderServiceLinkTag({
      service: 'comanage',
      variant: 'cta',
      children: 'Manage account settings',
    });

    const link = screen.getByRole('link', {
      name: 'Manage account settings',
    });
    expect(link).toHaveAttribute('href', 'https://id.lsst.cloud/');
    expect(link.className).toMatch(/ctaLink/);
  });

  test('without a repertoireUrl, renders the children as plain text', async () => {
    vi.mocked(getStaticConfig).mockResolvedValue(
      {} as Awaited<ReturnType<typeof getStaticConfig>>
    );

    const { container } = await renderServiceLinkTag({
      service: 'comanage',
      children: 'Account settings',
    });

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(container).toHaveTextContent('Account settings');
    expect(fetchServiceDiscovery).not.toHaveBeenCalled();
  });

  test('is in the common components that MDX pages import from lib/mdx/rsc', async () => {
    const rsc = await import('.');

    expect(rsc.commonMdxComponents.ServiceLink).toBe(
      commonMdxComponents.ServiceLink
    );
  });

  test('is registered for the footer MDX too', () => {
    expect(footerMdxComponents.ServiceLink).toBe(
      commonMdxComponents.ServiceLink
    );
  });
});
