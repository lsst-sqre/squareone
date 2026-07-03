import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

// Mock the RSC config loader so generateMetadata and the flag gate can run
// without the filesystem-backed config.
vi.mock('../../../lib/config/rsc', () => ({
  getStaticConfig: vi.fn(),
}));

// Mock next/navigation's notFound so we can assert it is called (and have it
// halt execution by throwing, as the real App Router implementation does).
vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

// Stub the client container so the server component can be rendered in
// isolation to assert the route id is plumbed through.
vi.mock('./NotificationDetailPageClient', () => ({
  default: ({ id }: { id: string }) => <div data-testid="client">id:{id}</div>,
}));

// Import after mocking.
import { notFound } from 'next/navigation';
import type { AppConfig } from '../../../lib/config/loader';
import { getStaticConfig } from '../../../lib/config/rsc';
import NotificationDetailPage, { generateMetadata } from './page';

function makeConfig(overrides: Partial<AppConfig> = {}): AppConfig {
  return {
    siteName: 'Rubin Science Platform',
    enableUserNotifications: true,
    ...overrides,
  } as AppConfig;
}

describe('NotificationDetailPage generateMetadata', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('sets the title from the id and config.siteName', async () => {
    vi.mocked(getStaticConfig).mockResolvedValue(makeConfig());

    const metadata = await generateMetadata({
      params: Promise.resolve({ id: 'ntf-001' }),
    });

    expect(metadata.title).toBe(
      'Notification ntf-001 | Rubin Science Platform'
    );
  });
});

describe('NotificationDetailPage flag gating', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('returns 404 when the feature flag is off', async () => {
    vi.mocked(getStaticConfig).mockResolvedValue(
      makeConfig({ enableUserNotifications: false })
    );

    await expect(
      NotificationDetailPage({ params: Promise.resolve({ id: 'ntf-001' }) })
    ).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFound).toHaveBeenCalled();
  });

  test('passes the awaited route id to the client when the flag is on', async () => {
    vi.mocked(getStaticConfig).mockResolvedValue(
      makeConfig({ enableUserNotifications: true })
    );

    const element = await NotificationDetailPage({
      params: Promise.resolve({ id: 'ntf-xyz' }),
    });
    render(element);

    expect(notFound).not.toHaveBeenCalled();
    expect(screen.getByTestId('client')).toHaveTextContent('id:ntf-xyz');
  });
});
