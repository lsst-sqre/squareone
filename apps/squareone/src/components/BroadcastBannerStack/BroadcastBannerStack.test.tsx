import type { Broadcast } from '@lsst-sqre/semaphore-client';
import * as semaphoreClient from '@lsst-sqre/semaphore-client';
import { render, screen } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';

import * as useSemaphoreUrlModule from '../../hooks/useSemaphoreUrl';
import BroadcastBannerStack from './BroadcastBannerStack';

vi.mock('@lsst-sqre/semaphore-client', async (importOriginal) => {
  const actual = await importOriginal<typeof semaphoreClient>();
  return {
    ...actual,
    useBroadcasts: vi.fn(),
  };
});
vi.mock('../../hooks/useSemaphoreUrl');

const useBroadcastsMock = vi.mocked(semaphoreClient.useBroadcasts);
const useSemaphoreUrlMock = vi.mocked(useSemaphoreUrlModule.useSemaphoreUrl);

function makeBroadcast(overrides: Partial<Broadcast> = {}): Broadcast {
  return {
    id: 'abc',
    summary: { gfm: 'Scheduled maintenance', html: 'Scheduled maintenance' },
    enabled: true,
    stale: false,
    category: 'info',
    ...overrides,
  } as Broadcast;
}

type UseBroadcastsResult = ReturnType<typeof semaphoreClient.useBroadcasts>;

function mockUseBroadcasts(overrides: Partial<UseBroadcastsResult>) {
  useBroadcastsMock.mockReturnValue({
    broadcasts: [],
    refetch: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
    ...overrides,
  } as UseBroadcastsResult);
}

beforeEach(() => {
  vi.clearAllMocks();
  useSemaphoreUrlMock.mockReturnValue('https://semaphore.example.com');
});

test('renders persistent live regions while the fetch is pending', () => {
  // The polite and assertive live regions must exist in the DOM before the
  // fetch resolves so a screen reader announces banners inserted into them.
  mockUseBroadcasts({ isPending: true });
  render(<BroadcastBannerStack />);

  expect(screen.getByRole('status')).toBeInTheDocument();
  expect(screen.getByRole('alert')).toBeInTheDocument();
});

test('renders persistent live regions when the Semaphore URL is unavailable', () => {
  useSemaphoreUrlMock.mockReturnValue(undefined);
  mockUseBroadcasts({ isPending: true });
  render(<BroadcastBannerStack />);

  expect(screen.getByRole('status')).toBeInTheDocument();
  expect(screen.getByRole('alert')).toBeInTheDocument();
});

test('renders persistent live regions on fetch error', () => {
  mockUseBroadcasts({ isError: true });
  render(<BroadcastBannerStack />);

  expect(screen.getByRole('status')).toBeInTheDocument();
  expect(screen.getByRole('alert')).toBeInTheDocument();
});

test('routes info banners into the polite status region', () => {
  mockUseBroadcasts({
    broadcasts: [makeBroadcast({ id: 'info-1', category: 'info' })],
  });
  render(<BroadcastBannerStack />);

  const status = screen.getByRole('status');
  expect(status).toHaveTextContent(/scheduled maintenance/i);
  expect(screen.getByRole('alert')).toBeEmptyDOMElement();
});

test('routes notice banners into the polite status region', () => {
  mockUseBroadcasts({
    broadcasts: [makeBroadcast({ id: 'notice-1', category: 'notice' })],
  });
  render(<BroadcastBannerStack />);

  expect(screen.getByRole('status')).toHaveTextContent(
    /scheduled maintenance/i
  );
  expect(screen.getByRole('alert')).toBeEmptyDOMElement();
});

test('routes outage banners into the assertive alert region', () => {
  mockUseBroadcasts({
    broadcasts: [makeBroadcast({ id: 'outage-1', category: 'outage' })],
  });
  render(<BroadcastBannerStack />);

  expect(screen.getByRole('alert')).toHaveTextContent(/scheduled maintenance/i);
  expect(screen.getByRole('status')).toBeEmptyDOMElement();
});

test('splits mixed broadcasts across the two regions', () => {
  mockUseBroadcasts({
    broadcasts: [
      makeBroadcast({
        id: 'info-1',
        category: 'info',
        summary: { gfm: 'Info message', html: 'Info message' },
      }),
      makeBroadcast({
        id: 'outage-1',
        category: 'outage',
        summary: { gfm: 'Outage message', html: 'Outage message' },
      }),
    ],
  });
  render(<BroadcastBannerStack />);

  expect(screen.getByRole('status')).toHaveTextContent(/info message/i);
  expect(screen.getByRole('status')).not.toHaveTextContent(/outage message/i);
  expect(screen.getByRole('alert')).toHaveTextContent(/outage message/i);
  expect(screen.getByRole('alert')).not.toHaveTextContent(/info message/i);
});
