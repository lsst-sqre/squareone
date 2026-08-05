/*
 * Terminal notebook-execution failure panel (DM-55470).
 *
 * Times Square reports a failed execution as an `execution_error` object whose
 * `title` and `message` are user-facing copy authored by the API. Squareone
 * renders that copy verbatim and never substitutes its own per-code guidance;
 * `code` only selects the panel's icon and tone, and an unrecognized code
 * (from a newer Times Square deployment) falls back to the generic treatment.
 */

import { Button } from '@lsst-sqre/squared';
import type { ExecutionError } from '@lsst-sqre/times-square-client';
import {
  Clock,
  type LucideIcon,
  PackageX,
  RotateCw,
  ServerCrash,
  TriangleAlert,
} from 'lucide-react';

import styles from './NotebookExecutionError.module.css';

export type NotebookExecutionErrorProps = {
  /** Terminal failure reported by the Times Square API. */
  executionError: ExecutionError;
  /** Request a fresh execution of this page instance. */
  onRerun: () => void;
  /** Whether a re-run request is in flight. */
  isRerunPending: boolean;
  /** Whether the last re-run request failed. */
  rerunFailed: boolean;
};

type Presentation = {
  icon: LucideIcon;
  /** CSS module class carrying the panel's accent color. */
  tone: string;
};

/**
 * Iconography and tone for the `execution_error.code` values known at build
 * time. Unknown codes fall through to {@link genericPresentation}.
 */
const presentations: Record<string, Presentation> = {
  timeout: { icon: Clock, tone: styles.warning },
  jupyter_error: { icon: ServerCrash, tone: styles.error },
  result_unavailable: { icon: PackageX, tone: styles.warning },
  unknown: { icon: TriangleAlert, tone: styles.error },
};

const genericPresentation: Presentation = {
  icon: TriangleAlert,
  tone: styles.error,
};

export default function NotebookExecutionError({
  executionError,
  onRerun,
  isRerunPending,
  rerunFailed,
}: NotebookExecutionErrorProps) {
  // `code` is API-supplied, so the lookup is guarded by an own-property check:
  // a plain `presentations[code]` would resolve inherited `Object.prototype`
  // members (`constructor`, `toString`, …) and bypass the generic fallback.
  const { icon: Icon, tone } = Object.hasOwn(presentations, executionError.code)
    ? presentations[executionError.code]
    : genericPresentation;

  return (
    <div className={[styles.panel, tone].join(' ')}>
      {/*
        The panel replaces the viewer's loading state once execution fails, so
        the failure copy is announced as an alert. The alert wraps only that
        text: an alert region is not meant to hold focusable content, so the
        re-run action sits outside it (the alternative, `alertdialog`, would
        claim a modality this panel does not have). The icon is decorative and
        already `aria-hidden`, leaving the title and message as the announcement.
      */}
      <div role="alert">
        <div className={styles.header}>
          <Icon className={styles.icon} size={24} aria-hidden="true" />
          <h2 className={styles.title}>{executionError.title}</h2>
        </div>
        <p className={styles.message}>{executionError.message}</p>
      </div>
      <div className={styles.actions}>
        <Button
          appearance="outline"
          tone="primary"
          leadingIcon={RotateCw}
          disabled={isRerunPending}
          onClick={onRerun}
        >
          Re-run notebook
        </Button>
        {/*
          Its own alert, the canonical use of the role: text inserted into the
          page in response to the click, announced where it appears rather than
          folded into the failure copy above.
        */}
        {rerunFailed && (
          <p className={styles.rerunError} role="alert">
            Failed to request a re-run. Please try again.
          </p>
        )}
      </div>
    </div>
  );
}
