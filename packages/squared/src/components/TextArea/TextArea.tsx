'use client';

import React, { forwardRef } from 'react';
import styles from './TextArea.module.css';

export type TextAreaProps = Omit<
  React.ComponentPropsWithoutRef<'textarea'>,
  'size'
> & {
  size?: 'sm' | 'md' | 'lg';
  appearance?: 'default' | 'error' | 'success';
  fullWidth?: boolean;
  minRows?: number;
  maxRows?: number;
  autoResize?: boolean;
};

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      size = 'md',
      appearance = 'default',
      fullWidth,
      minRows = 3,
      maxRows,
      autoResize = false,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const combinedRef = React.useMemo(
      () => (node: HTMLTextAreaElement) => {
        textareaRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      },
      [ref]
    );

    const [lineCount, setLineCount] = React.useState(minRows);

    React.useEffect(() => {
      if (!autoResize || !textareaRef.current) return undefined;

      const textarea = textareaRef.current;
      const adjustHeight = () => {
        const lines = textarea.value.split('\n').length;
        const scrollLines = Math.ceil(
          textarea.scrollHeight /
            parseFloat(getComputedStyle(textarea).lineHeight)
        );
        const actualLines = Math.max(lines, scrollLines);

        const clampedLines = Math.min(
          Math.max(actualLines, minRows),
          maxRows || Infinity
        );

        setLineCount(clampedLines);
      };

      adjustHeight();
      textarea.addEventListener('input', adjustHeight);
      return () => textarea.removeEventListener('input', adjustHeight);
    }, [autoResize, minRows, maxRows]);

    const containerClassNames = [
      styles.container,
      fullWidth && styles.fullWidth,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const textareaClassNames = [
      styles.textarea,
      styles[size],
      styles[appearance],
    ]
      .filter(Boolean)
      .join(' ');

    const combinedStyle = {
      ...style,
      '--textarea-rows': autoResize ? lineCount : minRows,
    } as React.CSSProperties;

    return (
      <div className={containerClassNames}>
        <textarea
          ref={combinedRef}
          className={textareaClassNames}
          style={combinedStyle}
          rows={minRows}
          data-auto-resize={autoResize}
          aria-invalid={appearance === 'error'}
          {...props}
        />
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

export default TextArea;
