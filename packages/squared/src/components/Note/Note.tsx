import styles from './Note.module.css';

export type NoteType = 'note' | 'warning' | 'tip' | 'info';

export type NoteProps = {
  /** Note content */
  children?: React.ReactNode;
  /** Type of note, affects color and label. Default: "note" */
  type?: NoteType;
  /** Optional className for styling overrides */
  className?: string;
};

const typeLabels: Record<NoteType, string> = {
  note: 'Note',
  warning: 'Warning',
  tip: 'Tip',
  info: 'Info',
};

/**
 * Note component - a callout/note container with type indicator badge.
 *
 * Supports different types: note (red), warning (orange), tip (green), info (blue).
 *
 * @example
 * ```tsx
 * <Note type="warning">
 *   Be careful when modifying these settings.
 * </Note>
 * ```
 */
export function Note({ children, type = 'note', className }: NoteProps) {
  const rootClassName = [styles.note, styles[type], className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClassName}>
      <div className={styles.titleBubble}>
        <span>{typeLabels[type]}</span>
      </div>
      {children}
    </div>
  );
}

export default Note;
