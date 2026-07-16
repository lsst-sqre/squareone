import type { Broadcast } from '@lsst-sqre/semaphore-client';
import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { axe } from 'vitest-axe';
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

test('does not carry its own live-region role', () => {
  // Live-region semantics live on the persistent containers rendered by
  // BroadcastBannerStack, which exist in the DOM before the fetch resolves.
  // A banner must not add a nested role="status"/role="alert" of its own or a
  // screen reader would announce it twice.
  render(<BroadcastBanner broadcast={makeBroadcast({ category: 'info' })} />);

  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

// axe's color-contrast rule cannot measure contrast in JSDOM (no canvas), so we
// disable it and assert the ARIA/landmark structure this task delivers.
const axeOptions = { rules: { 'color-contrast': { enabled: false } } };

test('has no axe violations for an info banner', async () => {
  const { container } = render(
    <BroadcastBanner broadcast={makeBroadcast({ category: 'info' })} />
  );

  const results = await axe(container, axeOptions);

  expect(results).toHaveNoViolations();
});

test('has no axe violations for an outage banner', async () => {
  const { container } = render(
    <BroadcastBanner broadcast={makeBroadcast({ category: 'outage' })} />
  );

  const results = await axe(container, axeOptions);

  expect(results).toHaveNoViolations();
});

test('renders nothing without a broadcast', () => {
  const { container } = render(<BroadcastBanner />);

  expect(container).toBeEmptyDOMElement();
});
