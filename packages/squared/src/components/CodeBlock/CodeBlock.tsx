'use client';

import { useEffect, useRef } from 'react';
import { useHorizontalOverflow } from '../../hooks/useHorizontalOverflow';
import ClipboardButton from '../ClipboardButton';
import styles from './CodeBlock.module.css';
import { CODE_BLOCK_ATTRIBUTE, scheduleHighlight } from './highlightScheduler';

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
 * Count the lines that a `<pre>` renders for the code. A single trailing
 * newline ends the last line rather than starting an empty one.
 */
function countLines(code: string): number {
  const lines = code.split(/\r\n?|\n/);
  if (lines.length > 1 && lines[lines.length - 1] === '') lines.pop();
  return lines.length;
}

/**
 * CodeBlock displays syntax-highlighted source code. It is the standard
 * syntax highlighter for Squareone apps.
 *
 * Highlighting comes from MicroLighter's core API, which colours the plain
 * `<pre><code>` text with the CSS Custom Highlight API and MicroLighter's
 * GitHub theme. Every `CodeBlock` on a page shares one highlight pass (see
 * `highlightScheduler.ts`), so a page with many blocks is highlighted once.
 * Apps load the theme by importing `@lsst-sqre/global-css/dist/syntax.css`
 * next to `dist/next.css`. Highlighting runs in the browser after hydration,
 * so server rendering and browsers without the Custom Highlight API show the
 * code as plain monospace text. Colours follow the site's `data-theme`, not
 * the OS preference. Long lines scroll horizontally, and only while they do is
 * the code focusable, so keyboard users can scroll it.
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
  // The shared pass reads the code and its language class from the DOM, so
  // schedule a pass whenever React renders new ones.
  useEffect(() => {
    void scheduleHighlight();
    // Re-highlight once this block leaves the page too, so the shared
    // highlights drop its ranges.
    return () => {
      void scheduleHighlight();
    };
  }, [code, language]);

  // Long lines scroll the code sideways. Only then is the code focusable, so
  // keyboard users can scroll it (WCAG 2.1.1, axe scrollable-region-focusable)
  // without a page of short snippets adding a Tab stop per block.
  const preRef = useRef<HTMLPreElement>(null);
  const scrolls = useHorizontalOverflow(preRef, code);

  // Name the block as a group only when a label is given; an unnamed group
  // adds nothing for assistive technology.
  const labelProps = ariaLabel
    ? { role: 'group', 'aria-label': ariaLabel }
    : undefined;

  // Marks the code frame for the shared highlight pass.
  const highlightTarget = { [CODE_BLOCK_ATTRIBUTE]: '' };

  // The copy button follows the code frame rather than sitting inside it:
  // the frame clips its rounded corners with overflow: hidden, and CSS
  // anchor positioning (see CodeBlock.module.css) places the button beside
  // the frame or on its top-right corner; the frame must precede the button
  // in DOM order.
  return (
    <div className={styles.codeBlock} {...labelProps}>
      <div
        data-syntax-theme="github"
        {...highlightTarget}
        className={styles.frame}
      >
        {lineNumbers && (
          <div className={styles.lineNumbers} aria-hidden="true">
            {Array.from(
              { length: countLines(code) },
              (_, index) => index + 1
            ).join('\n')}
          </div>
        )}
        <pre
          ref={preRef}
          className={styles.pre}
          tabIndex={scrolls ? 0 : undefined}
        >
          <code className={`language-${language}`}>{code}</code>
        </pre>
      </div>
      {copy && (
        <ClipboardButton
          text={code}
          label=""
          successLabel=""
          showIcon
          size="sm"
          appearance="text"
          tone="tertiary"
          ariaLabel="Copy code to clipboard"
          className={styles.copyButton}
        />
      )}
    </div>
  );
}

export default CodeBlock;
