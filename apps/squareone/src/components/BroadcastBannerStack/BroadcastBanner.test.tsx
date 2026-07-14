import type { Broadcast } from '@lsst-sqre/semaphore-client';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, test } from 'vitest';
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

test('derives a plain-text landmark name, not raw Markdown, from the summary', () => {
  // The accessible name must not expose Markdown syntax (asterisks, brackets,
  // URLs) that a screen reader would read aloud verbatim.
  render(
    <BroadcastBanner
      broadcast={makeBroadcast({
        summary: {
          gfm: 'Scheduled maintenance on **February 1, 2025**',
          html: '<p>Scheduled maintenance on <strong>February 1, 2025</strong></p>',
        },
      })}
    />
  );

  const landmark = screen.getByRole('complementary');
  expect(landmark).toHaveAccessibleName(
    'Scheduled maintenance on February 1, 2025'
  );
  expect(landmark.getAttribute('aria-label')).not.toContain('*');
});

test('falls back to a generic landmark name when the summary has no text', () => {
  render(
    <BroadcastBanner
      broadcast={makeBroadcast({
        summary: { gfm: '   ', html: '<p></p>' },
      })}
    />
  );

  expect(
    screen.getByRole('complementary', { name: 'Broadcast message' })
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

const broadcastData = {
  id: '1234',
  summary: {
    gfm: 'Hello world.',
    html: '<p>Hello world.</p>',
  },
  active: true,
  enabled: true,
  stale: false,
  category: 'other' as const,
};

describe('BroadcastBanner', () => {
  it('paints the info category with the accessible interactive teal token', () => {
    // The info banner draws white text on the category color, so the
    // background must be the accessible teal (>=4.5:1), not the raw brand
    // primary-600 (which only reaches 4.14:1 against white).
    const { container } = render(
      <BroadcastBanner broadcast={{ ...broadcastData, category: 'info' }} />
    );
    const banner = container.firstChild as HTMLElement;
    expect(banner.style.getPropertyValue('--banner-bg')).toBe(
      'var(--rsd-component-interactive-color)'
    );
  });

  it('keeps the outage category on the darker red for white-text contrast', () => {
    const { container } = render(
      <BroadcastBanner broadcast={{ ...broadcastData, category: 'outage' }} />
    );
    const banner = container.firstChild as HTMLElement;
    // Migration of the red/orange danger/notice colors is a separate task;
    // this only pins that the info migration did not disturb outage.
    expect(banner.style.getPropertyValue('--banner-bg')).toBe(
      'var(--rsd-color-red-500)'
    );
  });
});
