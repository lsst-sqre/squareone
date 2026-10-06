'use client';

import { useEffect } from 'react';
import styles from './CodeBlock.module.css';
import { registerMicroLighter } from './microLighter';

export type CodeBlockProps = {
  /** The source code to display. */
  code: string;
  /**
   * Language of the code, used to pick the syntax grammar, such as `json`,
   * `yaml`, `python`, or `bash`. Aliases like `yml`, `py`, `sh`, and `ts`
   * are accepted.
   */
  language: string;
  /** Show a line-number gutter. Default: `false`. */
  lineNumbers?: boolean;
  /** Show a button that copies the code (without line numbers). Default: `true`. */
  copy?: boolean;
  /** Accessible label for the code block, such as "Service discovery JSON". */
  ariaLabel?: string;
};

/**
 * CodeBlock displays syntax-highlighted source code. It is the standard
 * syntax highlighter for Squareone apps.
 *
 * Highlighting comes from MicroLighter's `<micro-lighter>` custom element,
 * which colours plain `<pre><code>` text with the CSS Custom Highlight API and
 * MicroLighter's GitHub theme (imported by `@lsst-sqre/global-css`). The
 * element registers in the browser after hydration, so server rendering and
 * browsers without the Custom Highlight API show the code as plain monospace
 * text. Colours follow the site's `data-theme`, not the OS preference.
 *
 * @example
 * ```tsx
 * <CodeBlock code={JSON.stringify(data, null, 2)} language="json" lineNumbers />
 * ```
 */
export function CodeBlock({
  code,
  language,
  lineNumbers = false,
  copy = true,
  ariaLabel,
}: CodeBlockProps) {
  useEffect(() => {
    void registerMicroLighter();
  }, []);

  // Name the block as a group only when a label is given; an unnamed group
  // adds nothing for assistive technology.
  const labelProps = ariaLabel
    ? { role: 'group', 'aria-label': ariaLabel }
    : undefined;

  return (
    <div
      data-syntax-theme="github"
      className={styles.codeBlock}
      {...labelProps}
    >
      <micro-lighter
        className={styles.highlighter}
        language={language}
        controls={copy ? 'copy' : undefined}
        line-numbers={lineNumbers || undefined}
      >
        <pre
          // biome-ignore lint/a11y/noNoninteractiveTabindex: long lines scroll horizontally, so keyboard users must be able to focus the code to scroll it (WCAG 2.1.1, axe scrollable-region-focusable).
          tabIndex={0}
        >
          <code className={`language-${language}`}>{code}</code>
        </pre>
      </micro-lighter>
    </div>
  );
}

export default CodeBlock;
