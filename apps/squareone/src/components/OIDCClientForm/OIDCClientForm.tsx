import { Button, FormField, Note } from '@lsst-sqre/squared';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

import styles from './OIDCClientForm.module.css';

/**
 * Whether {@link OIDCClientForm} is registering a new client or editing one
 * that already exists.
 *
 * Gafaelfawr's create (`POST`) and update (`PATCH`) bodies are the same
 * `OIDCClientUpdate` — the PATCH requires every updatable field too — so both
 * flows are one form. The mode only decides the wording of the submit button
 * and of a failed submit, not which fields exist or how they validate.
 */
export type OIDCClientFormMode = 'create' | 'edit';

/**
 * The values emitted by {@link OIDCClientForm} on a valid submit.
 *
 * `return_uri` and `description` are always present and non-empty; `notes` is
 * `undefined` when the optional field is left blank, so the container can omit
 * the key from the request body rather than sending an empty string.
 *
 * Named in Gafaelfawr's snake_case so a container can pass the object straight
 * to `createOidcClient` / `updateOidcClient` without a translation step.
 */
export type OIDCClientFormValues = {
  return_uri: string;
  description: string;
  notes?: string;
};

export type OIDCClientFormProps = {
  /** Create a new client or edit an existing one. Defaults to `'create'`. */
  mode?: OIDCClientFormMode;
  /**
   * Seed values for the fields. The edit flow passes the client's current
   * state; the create flow leaves this undefined for an empty form.
   */
  defaultValues?: Partial<OIDCClientFormValues>;
  /**
   * Called with the trimmed values on a valid submit. A rejected promise
   * surfaces as an inline error above the fields with the operator's input
   * intact, so a 422 from Gafaelfawr can be corrected in place.
   */
  onSubmit: (values: OIDCClientFormValues) => Promise<void>;
  /**
   * Called when the operator clicks Cancel. When omitted no Cancel button is
   * rendered.
   */
  onCancel?: () => void;
  /** Whether a submission is currently in flight. */
  isSubmitting?: boolean;
  /**
   * Disable every field and the submit button. Used to gate the form when the
   * signed-in admin lacks the scope Gafaelfawr's OIDC client API requires, so
   * submission is blocked rather than failing with a silent 403.
   */
  disabled?: boolean;
};

type OIDCClientFormFields = {
  return_uri: string;
  description: string;
  notes: string;
};

/**
 * Validate the return URI field.
 *
 * Gafaelfawr redirects to this URI after a successful login, so it has to be
 * absolute — a relative path has no meaning outside the browser that typed it.
 * `new URL(value)` (with no base) is exactly that test: it succeeds only for a
 * value carrying its own scheme. The scheme itself is not policed here, since
 * which schemes Gafaelfawr accepts is the server's call, and a client-side
 * guess would reject registrations the API would have allowed.
 */
function validateReturnUri(value: string): true | string {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return 'Return URI is required';
  }
  try {
    new URL(trimmed);
    return true;
  } catch {
    return 'Return URI must be an absolute URL, including the scheme (for example https://app.example.org/oauth/callback)';
  }
}

/** Wording that differs between the create and edit flows. */
const MODE_COPY: Record<
  OIDCClientFormMode,
  { submitLabel: string; failureLead: string }
> = {
  create: {
    submitLabel: 'Create client',
    failureLead: 'Failed to create the client.',
  },
  edit: {
    submitLabel: 'Save changes',
    failureLead: 'Failed to save changes.',
  },
};

/**
 * Form for registering or editing a Gafaelfawr OpenID Connect client.
 *
 * Presentational and container-agnostic: it owns field state, submit-time
 * validation, and the inline error callout, but delegates the actual write to
 * the `onSubmit` prop. `return_uri` and `description` are required — the two
 * fields Gafaelfawr demands on both `POST` and `PATCH` — and `notes` is free
 * text for whoever inherits the client later.
 *
 * A failed submit is rendered inline in a `Note` **without clearing the
 * fields**, following {@link NotificationForm}: the most common failure here
 * is a 422 about one of the values on screen, and discarding the input would
 * make the message unactionable.
 */
export function OIDCClientForm({
  mode = 'create',
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  disabled = false,
}: OIDCClientFormProps) {
  // Fields are disabled both while a submission is in flight and when the form
  // is gated (the admin lacks the OIDC admin scope); the button stays disabled
  // in either case but only shows the spinner while actually submitting.
  const isDisabled = isSubmitting || disabled;

  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OIDCClientFormFields>({
    defaultValues: {
      return_uri: defaultValues?.return_uri ?? '',
      description: defaultValues?.description ?? '',
      notes: defaultValues?.notes ?? '',
    },
  });

  const { submitLabel, failureLead } = MODE_COPY[mode];

  const handleFormSubmit = async (data: OIDCClientFormFields) => {
    setSubmitError(null);

    const trimmedNotes = data.notes.trim();

    try {
      await onSubmit({
        return_uri: data.return_uri.trim(),
        description: data.description.trim(),
        notes: trimmedNotes === '' ? undefined : trimmedNotes,
      });
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'The request failed.'
      );
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(handleFormSubmit)}>
      {submitError && (
        <Note type="warning">
          <p>
            <strong>{failureLead}</strong> {submitError}
          </p>
        </Note>
      )}

      <div className={styles.formContent}>
        <FormField
          error={errors.return_uri?.message}
          description="Where Gafaelfawr redirects after a successful login. Must be an absolute URL."
          required
        >
          <FormField.Label htmlFor="oidc-client-return-uri">
            Return URI
          </FormField.Label>
          <FormField.TextInput
            id="oidc-client-return-uri"
            placeholder="https://app.example.org/oauth/callback"
            disabled={isDisabled}
            autoComplete="off"
            spellCheck={false}
            fullWidth
            {...register('return_uri', { validate: validateReturnUri })}
          />
        </FormField>

        <FormField
          error={errors.description?.message}
          description="How this client is identified in the client list."
          required
        >
          <FormField.Label htmlFor="oidc-client-description">
            Description
          </FormField.Label>
          <FormField.TextInput
            id="oidc-client-description"
            placeholder="Example relying party"
            disabled={isDisabled}
            autoComplete="off"
            fullWidth
            {...register('description', {
              validate: (value) =>
                value.trim().length > 0 || 'Description is required',
            })}
          />
        </FormField>

        <FormField description="Optional free text — who owns this client, why it exists, anything the next administrator will want.">
          <FormField.Label htmlFor="oidc-client-notes">
            Notes (optional)
          </FormField.Label>
          <FormField.TextArea
            id="oidc-client-notes"
            rows={4}
            disabled={isDisabled}
            fullWidth
            {...register('notes')}
          />
        </FormField>
      </div>

      <div className={styles.actions}>
        <Button type="submit" loading={isSubmitting} disabled={isDisabled}>
          {submitLabel}
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

export default OIDCClientForm;
