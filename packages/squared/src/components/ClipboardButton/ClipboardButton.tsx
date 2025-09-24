import { useState, useCallback, useEffect, useRef } from 'react';
import { Clipboard, Check } from 'react-feather';
import Button, { ButtonProps } from '../Button/Button';
import { copyToClipboard } from '../../utils/clipboard';
import styles from './ClipboardButton.module.css';

export type ClipboardButtonProps = Omit<ButtonProps, 'onClick' | 'children'> & {
  text: string | (() => string);
  label?: string;
  successLabel?: string;
  successDuration?: number;
  showIcon?: boolean;
  onCopy?: (text: string) => void;
  onError?: (error: Error) => void;
  ariaLabel?: string;
};

const ClipboardButton = ({
  text,
  label = 'Copy',
  successLabel = 'Copied!',
  successDuration = 10000,
  showIcon = true,
  onCopy,
  onError,
  ariaLabel,
  className,
  disabled,
  size = 'md',
  ...buttonProps
}: ClipboardButtonProps) => {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      const textToCopy = typeof text === 'function' ? text() : text;

      const success = await copyToClipboard(textToCopy);

      if (success) {
        setCopied(true);
        onCopy?.(textToCopy);

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          setCopied(false);
        }, successDuration);
      } else {
        throw new Error('Copy operation failed');
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      onError?.(error as Error);
      setCopied(false);
    }
  }, [text, onCopy, onError, successDuration]);

  if (copied) {
    return (
      <div
        className={`${styles.successState} ${className || ''}`}
        data-size={size}
      >
        <Check className={styles.icon} size={16} aria-hidden="true" />
        <span>{successLabel}</span>
      </div>
    );
  }

  return (
    <Button
      {...buttonProps}
      size={size}
      onClick={handleCopy}
      disabled={disabled}
      className={`${styles.clipboardButton} ${className || ''}`}
      aria-label={ariaLabel || `Copy ${label} to clipboard`}
      leadingIcon={showIcon ? Clipboard : undefined}
    >
      {label}
    </Button>
  );
};

ClipboardButton.displayName = 'ClipboardButton';

export default ClipboardButton;
