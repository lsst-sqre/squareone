'use client';

import { type RefObject, useEffect, useState } from 'react';

/**
 * Track whether an element's content is wider than the element, so the
 * element scrolls (or clips) horizontally: `scrollWidth > clientWidth`.
 *
 * The hook measures the element after it mounts, whenever `content` changes,
 * and whenever a `ResizeObserver` reports that the element resized. Pass the
 * content the element renders as `content`: new content can overflow without
 * resizing the element, which a resize observer alone would miss. Before the
 * first measurement, such as in server-rendered HTML, it reports `false`.
 * Where `ResizeObserver` is missing, such as a jsdom test environment without
 * a stub, it still measures on mount and on content changes.
 *
 * @param ref A ref to the element to measure.
 * @param content The content the element renders; a change re-measures it.
 * @returns Whether the element's content overflows it horizontally.
 *
 * @example
 * ```tsx
 * const ref = useRef<HTMLPreElement>(null);
 * const scrolls = useHorizontalOverflow(ref, code);
 * return <pre ref={ref} tabIndex={scrolls ? 0 : undefined}>{code}</pre>;
 * ```
 */
export function useHorizontalOverflow(
  ref: RefObject<HTMLElement | null>,
  content?: unknown
): boolean {
  const [overflows, setOverflows] = useState(false);

  // `content` is a dependency only to re-measure after the content changes.
  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    const measure = () => {
      setOverflows(element.scrollWidth > element.clientWidth);
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, content]);

  return overflows;
}

export default useHorizontalOverflow;
