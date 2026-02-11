import * as Dialog from '@radix-ui/react-dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { X } from 'lucide-react';
import styles from './Modal.module.css';

export type ModalSize = 'small' | 'medium' | 'large';

export type ModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
  size?: ModalSize;
  closeButton?: boolean;
  visuallyHideTitle?: boolean;
  visuallyHideDescription?: boolean;
  onInteractOutside?: (event: Event) => void;
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
  visuallyHideTitle = false,
  visuallyHideDescription = false,
  onInteractOutside,
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content
          className={`${styles.content} ${className || ''}`}
          data-size={size}
          onInteractOutside={onInteractOutside}
        >
          {visuallyHideTitle ? (
            <VisuallyHidden.Root>
              <Dialog.Title>{title}</Dialog.Title>
            </VisuallyHidden.Root>
          ) : (
            <Dialog.Title className={styles.title}>{title}</Dialog.Title>
          )}
          {visuallyHideDescription ? (
            <VisuallyHidden.Root>
              <Dialog.Description>{description}</Dialog.Description>
            </VisuallyHidden.Root>
          ) : (
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
