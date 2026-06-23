import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

// Mock the RSC config loader so generateMetadata can run without the
// filesystem-backed config.
vi.mock('@/lib/config/rsc', () => ({
  getStaticConfig: vi.fn(),
}));

// Stub the client container so the server component can be rendered in
// isolation to assert the route id is plumbed through.
vi.mock('./NotificationDetailPageClient', () => ({
  default: ({ id }: { id: string }) => <div data-testid="client">id:{id}</div>,
}));

// Import after mocking.
import type { AppConfig } from '@/lib/config/loader';
import { getStaticConfig } from '@/lib/config/rsc';
import NotificationDetailPage, { generateMetadata } from './page';

function makeConfig(overrides: Partial<AppConfig> = {}): AppConfig {
  return {
    siteName: 'Rubin Science Platform',
    ...overrides,
  } as AppConfig;
}

describe('NotificationDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('generateMetadata sets the title from the id and config.siteName', async () => {
    vi.mocked(getStaticConfig).mockResolvedValue(makeConfig());

    const metadata = await generateMetadata({
      params: Promise.resolve({ id: 'ntf-001' }),
    });

    expect(metadata.title).toBe(
      'Notification ntf-001 | Rubin Science Platform'
    );
  });

  test('passes the awaited route id to the client container', async () => {
    const element = await NotificationDetailPage({
      params: Promise.resolve({ id: 'ntf-xyz' }),
    });

    render(element);

    expect(screen.getByTestId('client')).toHaveTextContent('id:ntf-xyz');
  });
});
