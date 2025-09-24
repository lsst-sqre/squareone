import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'react-feather';
import styles from './Modal.module.css';

export type ModalSize = 'small' | 'medium' | 'large';

export type ModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  size?: ModalSize;
  closeButton?: boolean;
};

export default function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  size = 'medium',
  closeButton = true,
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content
          className={`${styles.content} ${className || ''}`}
          data-size={size}
        >
          {title && (
            <Dialog.Title className={styles.title}>{title}</Dialog.Title>
          )}
          {description && (
            <Dialog.Description className={styles.description}>
              {description}
            </Dialog.Description>
          )}
          {children}
          {closeButton && (
            <Dialog.Close className={styles.closeButton} aria-label="Close">
              <X size={20} />
            </Dialog.Close>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
