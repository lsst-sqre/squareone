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

test('wraps info banners in a polite status live region', () => {
  // Banners appear after a client-side fetch; a role="status" (polite) live
  // region lets a screen reader announce an info banner without stealing focus.
  render(<BroadcastBanner broadcast={makeBroadcast({ category: 'info' })} />);

  const status = screen.getByRole('status');
  expect(status).toBeInTheDocument();
  expect(status).toHaveTextContent(/scheduled maintenance/i);
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

test('wraps notice banners in a polite status live region', () => {
  render(<BroadcastBanner broadcast={makeBroadcast({ category: 'notice' })} />);

  expect(screen.getByRole('status')).toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

test('wraps outage banners in an assertive alert live region', () => {
  // An outage is urgent, so it uses role="alert" (assertive) rather than the
  // polite status region used for info/notice.
  render(<BroadcastBanner broadcast={makeBroadcast({ category: 'outage' })} />);

  const alert = screen.getByRole('alert');
  expect(alert).toBeInTheDocument();
  expect(alert).toHaveTextContent(/scheduled maintenance/i);
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});

// The banner colors are a separate color-token task (PRD #550 stream 1); axe's
// color-contrast rule also cannot measure contrast in JSDOM (no canvas), so we
// disable it and assert the ARIA/live-region structure this task delivers.
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
