import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { PrimaryNavigation } from './PrimaryNavigation';

/**
 * Install a controllable `window.matchMedia` mock so tests can drive the
 * collapse-breakpoint `change` event that {@link PrimaryNavigation} listens to.
 * jsdom does not implement matchMedia, and the change listeners it stores are
 * exposed via `emit()` so a test can simulate the viewport crossing the
 * breakpoint. Returns the controller and a restore function.
 */
function installMatchMediaMock(initialMatches = true) {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  let matches = initialMatches;
  const original = window.matchMedia;

  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    get matches() {
      return matches;
    },
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: (_event: string, listener: EventListener) => {
      listeners.add(listener as (event: MediaQueryListEvent) => void);
    },
    removeEventListener: (_event: string, listener: EventListener) => {
      listeners.delete(listener as (event: MediaQueryListEvent) => void);
    },
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;

  return {
    /** Simulate the viewport crossing the breakpoint. */
    emit(nextMatches: boolean) {
      matches = nextMatches;
      for (const listener of listeners) {
        listener({ matches: nextMatches } as MediaQueryListEvent);
      }
    },
    /** Number of currently-registered change listeners. */
    get listenerCount() {
      return listeners.size;
    },
    restore() {
      window.matchMedia = original;
    },
  };
}

/**
 * Render a representative PrimaryNavigation tree with a mix of link items and a
 * dropdown item, mirroring how the app's HeaderNav uses the component.
 */
function renderNav(props: React.ComponentProps<typeof PrimaryNavigation> = {}) {
  return render(
    <PrimaryNavigation aria-label="Main" {...props}>
      <PrimaryNavigation.Item>
        <PrimaryNavigation.TriggerLink href="/portal">
          Portal
        </PrimaryNavigation.TriggerLink>
      </PrimaryNavigation.Item>
      <PrimaryNavigation.Item>
        <PrimaryNavigation.TriggerLink href="/docs">
          Documentation
        </PrimaryNavigation.TriggerLink>
      </PrimaryNavigation.Item>
    </PrimaryNavigation>
  );
}

describe('PrimaryNavigation collapsed/hamburger mode', () => {
  it('renders a toggle button with an accessible name and aria-expanded', () => {
    renderNav();

    const toggle = screen.getByRole('button', {
      name: 'Open navigation menu',
    });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('does not render the toggle when collapsible is false', () => {
    renderNav({ collapsible: false });

    expect(
      screen.queryByRole('button', { name: /navigation menu/i })
    ).not.toBeInTheDocument();
  });

  it('exposes the item list via aria-controls on the toggle', () => {
    renderNav();

    const toggle = screen.getByRole('button', {
      name: 'Open navigation menu',
    });
    const controlsId = toggle.getAttribute('aria-controls');
    expect(controlsId).toBeTruthy();
    expect(document.getElementById(controlsId as string)).not.toBeNull();
  });

  it('toggles aria-expanded and accessible name when clicked', async () => {
    const user = userEvent.setup();
    renderNav();

    const toggle = screen.getByRole('button', {
      name: 'Open navigation menu',
    });
    await user.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(toggle).toHaveAccessibleName('Close navigation menu');

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveAccessibleName('Open navigation menu');
  });

  it('closes the menu on Escape and returns focus to the toggle', async () => {
    const user = userEvent.setup();
    renderNav();

    const toggle = screen.getByRole('button', {
      name: 'Open navigation menu',
    });
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await user.keyboard('{Escape}');

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveFocus();
  });

  it('stays open when Escape was already consumed by a nested dismissable layer', async () => {
    const user = userEvent.setup();
    renderNav();

    const toggle = screen.getByRole('button', {
      name: 'Open navigation menu',
    });
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    // Simulate Radix's DismissableLayer, which handles Escape on a capture-phase
    // document listener and calls preventDefault() when it dismisses an inner
    // dropdown. The menu-level handler must ignore such a pre-consumed event.
    document.addEventListener(
      'keydown',
      (event) => {
        if (event.key === 'Escape') event.preventDefault();
      },
      { capture: true, once: true }
    );

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', cancelable: true })
    );

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  it('keeps navigation links keyboard operable when expanded', async () => {
    const user = userEvent.setup();
    renderNav();

    const toggle = screen.getByRole('button', {
      name: 'Open navigation menu',
    });
    await user.click(toggle);

    const portalLink = screen.getByRole('link', { name: 'Portal' });
    portalLink.focus();
    expect(portalLink).toHaveFocus();
  });

  it('closes the menu when a navigation link is activated', async () => {
    const user = userEvent.setup();
    renderNav();

    const toggle = screen.getByRole('button', {
      name: 'Open navigation menu',
    });
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    // Clicking a nav link (a client-side <Link>/anchor) should collapse the
    // menu so the destination page doesn't render with it still expanded.
    await user.click(screen.getByRole('link', { name: 'Portal' }));

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('has no axe accessibility violations in the collapsed state', async () => {
    const { container } = renderNav();

    // color-contrast relies on canvas rendering that jsdom lacks; it is covered
    // by the Storybook a11y checks that run in a real browser.
    const results = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });
});

describe('PrimaryNavigation viewport-growth reset', () => {
  let mediaMock: ReturnType<typeof installMatchMediaMock>;

  beforeEach(() => {
    // Start below the collapse breakpoint (query matches).
    mediaMock = installMatchMediaMock(true);
  });

  afterEach(() => {
    mediaMock.restore();
  });

  it('closes the menu when the viewport grows past the breakpoint', async () => {
    const user = userEvent.setup();
    renderNav();

    const toggle = screen.getByRole('button', {
      name: 'Open navigation menu',
    });
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    // Simulate the viewport growing onto desktop: the query no longer matches.
    act(() => {
      mediaMock.emit(false);
    });

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('leaves the menu untouched while still within the collapse range', async () => {
    const user = userEvent.setup();
    renderNav();

    const toggle = screen.getByRole('button', {
      name: 'Open navigation menu',
    });
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    // A change event that still matches (e.g. resizing within mobile widths)
    // must not close the menu.
    act(() => {
      mediaMock.emit(true);
    });

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  it('removes the change listener on unmount', () => {
    const { unmount } = renderNav();

    expect(mediaMock.listenerCount).toBe(1);
    unmount();
    expect(mediaMock.listenerCount).toBe(0);
  });

  it('does not register a listener when collapsible is false', () => {
    renderNav({ collapsible: false });

    expect(mediaMock.listenerCount).toBe(0);
  });
});
