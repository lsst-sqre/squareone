import type { Broadcast } from '@lsst-sqre/semaphore-client';
import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import BroadcastBanner from './BroadcastBanner';

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

test('names its complementary landmark so it is unique among banners', () => {
  // Multiple banners can appear at once; naming each <aside> keeps the
  // complementary landmarks distinct for axe landmark-unique.
  render(<BroadcastBanner broadcast={makeBroadcast()} />);

  expect(
    screen.getByRole('complementary', { name: /scheduled maintenance/i })
  ).toBeInTheDocument();
});

test('renders nothing without a broadcast', () => {
  const { container } = render(<BroadcastBanner />);

  expect(container).toBeEmptyDOMElement();
});
