/**
 * Client-side registration of MicroLighter's `<micro-lighter>` custom element.
 *
 * MicroLighter (https://github.com/davatron5000/microlighter) highlights plain
 * `<pre><code class="language-*">` blocks with the CSS Custom Highlight API,
 * so the DOM stays plain text. The element module touches `document` and
 * `customElements` at import time, so it is only ever loaded with a dynamic
 * import from the browser, never during server rendering.
 */

import type { DetailedHTMLProps, HTMLAttributes } from 'react';

/**
 * Attributes accepted by the `<micro-lighter>` custom element.
 */
export type MicroLighterAttributes = DetailedHTMLProps<
  HTMLAttributes<HTMLElement>,
  HTMLElement
> & {
  /** Grammar name or alias, such as `json`, `yaml`, `python`, or `bash`. */
  language?: string;
  /** Space- or comma-separated controls to show; `copy` adds a copy button. */
  controls?: string;
  /** Show a line-number gutter when present. */
  'line-numbers'?: boolean;
};

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'micro-lighter': MicroLighterAttributes;
    }
  }
}

let registration: Promise<boolean> | undefined;

/**
 * Whether this environment can run MicroLighter: a browser with custom
 * elements and the CSS Custom Highlight API. False during server rendering,
 * under jsdom, and in browsers without `CSS.highlights`, where code blocks
 * stay plain monospace text.
 */
export function supportsMicroLighter(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.customElements !== 'undefined' &&
    typeof CSS !== 'undefined' &&
    'highlights' in CSS
  );
}

/**
 * Register the `<micro-lighter>` custom element, once per page.
 *
 * Resolves to `true` once the element is defined, or `false` when the
 * environment can't highlight (see {@link supportsMicroLighter}) or the
 * element module fails to load. Repeated calls share one registration.
 */
export function registerMicroLighter(): Promise<boolean> {
  if (!supportsMicroLighter()) return Promise.resolve(false);
  registration ??= import('microlighter/micro-lighter-element.js').then(
    () => true,
    // Plain, unhighlighted code is the fallback; nothing else to do.
    () => false
  );
  return registration;
}
