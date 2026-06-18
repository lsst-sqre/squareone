import { Button, Checkbox, FormField, Note } from '@lsst-sqre/squared';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import RenderedMarkdown from '../RenderedMarkdown';
import styles from './NotificationForm.module.css';

/**
 * The values emitted by {@link NotificationForm} on a valid submit.
 *
 * `recipient` and `summary` are always present; `body` is `undefined` when the
 * (optional) body field is left blank. `draftAnother` reflects the "draft
 * another" checkbox so the container can decide whether to stay on the page or
 * navigate back to the listing after a successful send.
 */
export type NotificationFormValues = {
  recipient: string;
  summary: string;
  body?: string;
  draftAnother: boolean;
};

/**
 * Shape accepted by {@link NotificationForm}'s `initialValues` prop. Originates
 * from `recipient`/`summary`/`body` query parameters so notifications can be
 * drafted from operational run books. Only the keys actually supplied seed
 * fields; omitted ones keep the form's empty defaults.
 */
export type NotificationFormInitialValues = {
  recipient?: string;
  summary?: string;
  body?: string;
};

export type NotificationFormProps = {
  initialValues?: NotificationFormInitialValues;
  /**
   * Called with the parsed values on a valid submit. The container wires this
   * to {@link useCreateAdminNotification}; a rejected promise surfaces as an
   * inline error and a resolved promise with `draftAnother` set clears the form
   * and shows the success confirmation.
   */
  onSubmit: (values: NotificationFormValues) => Promise<void>;
  /**
   * Called when the user clicks Cancel. When omitted, no Cancel button is
   * rendered. The compose page passes a handler that returns to the listing.
   */
  onCancel?: () => void;
  isSubmitting?: boolean;
  /**
   * Disable every field and the submit button. Used to gate the form when the
   * signed-in admin lacks the `admin:notifications` scope, so submission is
   * blocked rather than failing with a silent 403.
   */
  disabled?: boolean;
};

type NotificationFormFields = {
  recipient: string;
  summary: string;
  body: string;
  draftAnother: boolean;
};

/**
 * Form for composing and sending an admin user notification.
 *
 * Presentational and container-agnostic: it owns field state, submit-time
 * validation, the live Markdown preview, and the success/error callouts, but
 * delegates the actual send to the `onSubmit` prop. `recipient` and `summary`
 * are required; the summary is inline Markdown only while the body supports full
 * Markdown, each with a live {@link RenderedMarkdown} preview.
 *
 * On a successful send with "draft another" checked the form clears and shows an
 * inline success confirmation; with it unchecked the container navigates away. A
 * failed send shows a clear inline error without losing the operator's input.
 */
export function NotificationForm({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  disabled = false,
}: NotificationFormProps) {
  // Fields are disabled both while a submission is in flight and when the form
  // is gated (the admin lacks `admin:notifications`); the button stays disabled
  // in either case but only shows the spinner while actually submitting.
  const isDisabled = isSubmitting || disabled;

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<NotificationFormFields>({
    defaultValues: {
      recipient: initialValues?.recipient || '',
      summary: initialValues?.summary || '',
      body: initialValues?.body || '',
      draftAnother: false,
    },
  });

  // Watched values drive the live previews; they re-render on every keystroke.
  const summaryValue = watch('summary');
  const bodyValue = watch('body');

  const handleFormSubmit = async (data: NotificationFormFields) => {
    setSubmitError(null);
    setShowSuccess(false);

    const trimmedBody = data.body.trim();

    try {
      await onSubmit({
        recipient: data.recipient.trim(),
        summary: data.summary,
        body: trimmedBody === '' ? undefined : data.body,
        draftAnother: data.draftAnother,
      });

      // On the "draft another" path the container stays on the page, so clear
      // the message fields for the next draft and confirm the send. The
      // checkbox is intentionally left checked so the operator keeps drafting.
      // On the unchecked path the container navigates to the listing, so there
      // is nothing to reset here.
      if (data.draftAnother) {
        reset({ recipient: '', summary: '', body: '', draftAnother: true });
        setShowSuccess(true);
      }
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to send notification.'
      );
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(handleFormSubmit)}>
      {showSuccess && (
        <Note type="tip">
          <p>Notification sent.</p>
        </Note>
      )}
      {submitError && (
        <Note type="warning">
          <p>
            <strong>Failed to send notification.</strong> {submitError}
          </p>
        </Note>
      )}

      <div className={styles.formContent}>
        {/* Recipient */}
        <FormField error={errors.recipient?.message} required>
          <FormField.Label htmlFor="notification-recipient">
            Recipient
          </FormField.Label>
          <FormField.TextInput
            id="notification-recipient"
            placeholder="username"
            disabled={isDisabled}
            autoComplete="off"
            fullWidth
            {...register('recipient', {
              validate: (value) =>
                value.trim().length > 0 || 'Recipient is required',
            })}
          />
        </FormField>

        {/* Summary (inline Markdown) */}
        <FormField
          error={errors.summary?.message}
          description="Inline Markdown only (e.g. **bold**, `code`, and [links](https://example.org))."
          required
        >
          <FormField.Label htmlFor="notification-summary">
            Summary
          </FormField.Label>
          <FormField.TextArea
            id="notification-summary"
            rows={2}
            placeholder="A short, one-line summary"
            disabled={isDisabled}
            fullWidth
            {...register('summary', {
              validate: (value) =>
                value.trim().length > 0 || 'Summary is required',
            })}
          />
        </FormField>

        {summaryValue.trim() !== '' && (
          <div className={styles.preview}>
            <span className={styles.previewLabel}>Summary preview</span>
            <RenderedMarkdown markdown={summaryValue} />
          </div>
        )}

        {/* Body (full Markdown) */}
        <FormField description="Full Markdown, including headings, lists, and tables.">
          <FormField.Label htmlFor="notification-body">
            Body (optional)
          </FormField.Label>
          <FormField.TextArea
            id="notification-body"
            rows={6}
            placeholder="Optional full-Markdown body"
            disabled={isDisabled}
            fullWidth
            {...register('body')}
          />
        </FormField>

        {bodyValue.trim() !== '' && (
          <div className={styles.preview}>
            <span className={styles.previewLabel}>Body preview</span>
            <RenderedMarkdown markdown={bodyValue} />
          </div>
        )}

        {/* Draft another */}
        <Controller
          name="draftAnother"
          control={control}
          render={({ field }) => (
            <Checkbox
              id="notification-draft-another"
              label="Draft another after sending"
              description="Stay on this page and clear the form so you can compose another notification."
              checked={field.value}
              onCheckedChange={(checked) => field.onChange(checked === true)}
              disabled={isDisabled}
            />
          )}
        />
      </div>

      {/* Form actions */}
      <div className={styles.actions}>
        <Button type="submit" loading={isSubmitting} disabled={isDisabled}>
          Send notification
        </Button>
        {onCancel && (
          <Button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            variant="secondary"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

export default NotificationForm;
