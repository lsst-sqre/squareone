import { act, render, screen } from '@testing-library/react';
import { useRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useHorizontalOverflow } from './useHorizontalOverflow';

/**
 * The layout widths that the mocked `scrollWidth` and `clientWidth` report,
 * since jsdom has no layout and reports zero for both.
 */
const layout = { scrollWidth: 0, clientWidth: 0 };

/**
 * A ResizeObserver stand-in that records each observer so a test can report
 * a resize, which jsdom never does.
 */
class FakeResizeObserver {
  static instances: FakeResizeObserver[] = [];

  callback: ResizeObserverCallback;

  observed: Element[] = [];

  disconnected = false;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    FakeResizeObserver.instances.push(this);
  }

  observe(target: Element) {
    this.observed.push(target);
  }

  unobserve() {}

  disconnect() {
    this.disconnected = true;
  }
}

/** Report a resize to every connected observer. */
function resize() {
  act(() => {
    for (const observer of FakeResizeObserver.instances) {
      if (!observer.disconnected) {
        observer.callback([], observer as unknown as ResizeObserver);
      }
    }
  });
}

/** A scrolling box that shows whether its content overflows. */
function Scroller({ content }: { content: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const overflows = useHorizontalOverflow(ref, content);
  return (
    <div ref={ref} data-testid="scroller" data-overflows={overflows}>
      {content}
    </div>
  );
}

function getOverflows() {
  return screen.getByTestId('scroller').dataset.overflows;
}

describe('useHorizontalOverflow', () => {
  beforeEach(() => {
    layout.scrollWidth = 0;
    layout.clientWidth = 0;
    vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockImplementation(
      () => layout.scrollWidth
    );
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(
      () => layout.clientWidth
    );
    FakeResizeObserver.instances = [];
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('reports no overflow when the content fits', () => {
    layout.scrollWidth = 100;
    layout.clientWidth = 100;
    render(<Scroller content="short" />);
    expect(getOverflows()).toBe('false');
  });

  it('reports overflow when the content is wider than the element', () => {
    layout.scrollWidth = 300;
    layout.clientWidth = 100;
    render(<Scroller content="a long line" />);
    expect(getOverflows()).toBe('true');
  });

  it('updates when the element resizes', () => {
    layout.scrollWidth = 300;
    layout.clientWidth = 100;
    render(<Scroller content="a long line" />);
    expect(getOverflows()).toBe('true');

    // Widen the element until the line fits.
    layout.clientWidth = 400;
    resize();
    expect(getOverflows()).toBe('false');

    // Narrow it again until the line overflows.
    layout.clientWidth = 200;
    resize();
    expect(getOverflows()).toBe('true');
  });

  it('observes the element for resizes', () => {
    render(<Scroller content="short" />);
    const [observer] = FakeResizeObserver.instances;
    expect(observer?.observed).toEqual([screen.getByTestId('scroller')]);
  });

  it('remeasures when the content changes', () => {
    // New content can overflow without resizing the element, so a resize
    // observer alone would miss it.
    layout.scrollWidth = 100;
    layout.clientWidth = 100;
    const { rerender } = render(<Scroller content="short" />);
    expect(getOverflows()).toBe('false');

    layout.scrollWidth = 300;
    rerender(<Scroller content="a much longer line" />);
    expect(getOverflows()).toBe('true');
  });

  it('stops observing when unmounted', () => {
    const { unmount } = render(<Scroller content="short" />);
    unmount();
    expect(FakeResizeObserver.instances.length).toBeGreaterThan(0);
    for (const observer of FakeResizeObserver.instances) {
      expect(observer.disconnected).toBe(true);
    }
  });

  it('still measures where ResizeObserver is missing', () => {
    // Such as a jsdom test environment without a ResizeObserver stub.
    vi.stubGlobal('ResizeObserver', undefined);
    layout.scrollWidth = 300;
    layout.clientWidth = 100;
    render(<Scroller content="a long line" />);
    expect(getOverflows()).toBe('true');
  });
});
