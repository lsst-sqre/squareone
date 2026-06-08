import { Button, FormField } from '@lsst-sqre/squared';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { validateBotUsername } from '../../lib/tokens/botUsername';
import type { ExpirationValue } from '../../lib/tokens/expiration';
import {
  parseServiceTokenMetadata,
  type ServiceTokenMetadata,
  type ServiceTokenMetadataInput,
  validateGroupsField,
  validateIdField,
} from '../../lib/tokens/serviceTokenMetadata';
import { ExpirationSelector, type Scope, ScopeSelector } from '../TokenForm';
import styles from './ServiceTokenForm.module.css';

export type ServiceTokenFormValues = {
  username: string;
  scopes: string[];
  expiration: ExpirationValue;
  /**
   * Parsed optional identity metadata. Only fields the operator supplied are
   * present, so omitted fields stay out of the request body.
   */
  metadata: ServiceTokenMetadata;
};

/**
 * Internal react-hook-form field shape: the advanced-metadata inputs are raw
 * strings until {@link parseServiceTokenMetadata} converts them on submit.
 */
type ServiceTokenFormFields = Omit<ServiceTokenFormValues, 'metadata'> & {
  metadata: ServiceTokenMetadataInput;
};

/**
 * Shape accepted by {@link ServiceTokenForm}'s `initialValues` prop.
 *
 * The core `username`/`scopes`/`expiration` fields mirror the parsed
 * {@link ServiceTokenFormValues}, but the optional Advanced-settings metadata is
 * provided as the raw *input* strings the text inputs hold (`uid`/`gid` as
 * strings, `groups` as the textarea string) rather than the parsed
 * {@link ServiceTokenMetadata}. These initial values originate from string query
 * parameters and seed the raw-string fields directly. Only the keys actually
 * supplied populate fields; omitted ones keep the form's empty defaults.
 */
export type ServiceTokenFormInitialValues = Partial<
  Omit<ServiceTokenFormValues, 'metadata'>
> & {
  metadata?: Partial<ServiceTokenMetadataInput>;
};

export type ServiceTokenFormProps = {
  /**
   * The full set of scopes that can be granted to a service token. An
   * `admin:token` holder may grant any configured scope, so this should be the
   * complete `loginInfo.config.scopes` list rather than the admin's own scopes.
   */
  availableScopes: Scope[];
  initialValues?: ServiceTokenFormInitialValues;
  onSubmit: (values: ServiceTokenFormValues) => Promise<void>;
  /**
   * Called when the user clicks the Cancel button. When omitted, no Cancel
   * button is rendered. The `/admin/service-tokens/new` page passes a handler
   * that navigates back to the service-tokens landing page.
   */
  onCancel?: () => void;
  isSubmitting?: boolean;
  /**
   * Disable every field and the submit button. Used to gate the form when the
   * signed-in admin lacks the `admin:token` scope required to create service
   * tokens, so submission is blocked rather than failing with a silent 403.
   */
  disabled?: boolean;
};

const EMPTY_METADATA_INPUT: ServiceTokenMetadataInput = {
  name: '',
  email: '',
  uid: '',
  gid: '',
  groups: '',
};

/**
 * Form for creating a Gafaelfawr service token for a `bot-` user.
 *
 * Mirrors {@link TokenForm} but adds a bot-username field (validated against the
 * Gafaelfawr username rules via {@link validateBotUsername}) and defaults the
 * expiration to "never". The scope picker is fed the full configured scope list
 * because an `admin:token` holder can grant any scope to a service token.
 *
 * A collapsible "Advanced settings" section (collapsed by default) collects the
 * optional `name`/`email`/`uid`/`gid`/`groups` identity fields. Only the values
 * that are actually supplied are forwarded in the submitted `metadata` object.
 */
export default function ServiceTokenForm({
  availableScopes,
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  disabled = false,
}: ServiceTokenFormProps) {
  // Fields are disabled both while a submission is in flight and when the form
  // is gated (e.g. the admin lacks `admin:token`); the button stays disabled in
  // either case but only shows the loading spinner while actually submitting.
  const isDisabled = isSubmitting || disabled;

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ServiceTokenFormFields>({
    // Validate fields on blur (matching the squared FormField/TextArea
    // convention) so the bot-username and metadata validators report errors as
    // soon as a field loses focus, before submit.
    mode: 'onBlur',
    defaultValues: {
      username: initialValues?.username || '',
      scopes: initialValues?.scopes || [],
      expiration: initialValues?.expiration || { type: 'never' },
      // Seed every metadata input with an empty default, then overlay only the
      // fields supplied via initialValues so omitted ones keep their defaults.
      metadata: { ...EMPTY_METADATA_INPUT, ...initialValues?.metadata },
    },
  });

  const handleFormSubmit = async (data: ServiceTokenFormFields) => {
    try {
      await onSubmit({
        username: data.username,
        scopes: data.scopes,
        expiration: data.expiration,
        metadata: parseServiceTokenMetadata(data.metadata),
      });
    } catch (error) {
      // Error handling is managed by the parent component.
      console.error('Service token form submission error:', error);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(handleFormSubmit)}>
      <div className={styles.formContent}>
        {/* Bot username field */}
        <FormField error={errors.username?.message} required>
          <FormField.Label htmlFor="service-token-username">
            Bot username
          </FormField.Label>
          <FormField.TextInput
            id="service-token-username"
            placeholder="bot-example"
            disabled={isDisabled}
            autoComplete="off"
            data-1p-ignore
            data-form-type="other"
            {...register('username', {
              // Trim before validate + submit so stray whitespace doesn't
              // produce a confusing username regex error.
              setValueAs: (value) => value.trim(),
              validate: (value) => validateBotUsername(value) ?? true,
            })}
          />
        </FormField>

        {/* Scopes field */}
        <FormField error={errors.scopes?.message} required>
          <Controller
            name="scopes"
            control={control}
            rules={{
              validate: (value) =>
                value.length > 0 || 'At least one scope must be selected',
            }}
            render={({ field }) => (
              <ScopeSelector
                scopes={availableScopes}
                selectedScopes={field.value}
                onChange={field.onChange}
                disabled={isDisabled}
                name="scopes"
              />
            )}
          />
        </FormField>

        {/* Expiration field */}
        <Controller
          name="expiration"
          control={control}
          rules={{
            required: 'Token expiration must be selected',
          }}
          render={({ field }) => (
            <ExpirationSelector
              value={field.value}
              onChange={field.onChange}
              disabled={isDisabled}
              name="expiration"
              required
            />
          )}
        />

        {/* Advanced settings (collapsed by default) */}
        <details className={styles.advanced}>
          <summary className={styles.advancedSummary}>
            Advanced settings
          </summary>
          <div className={styles.advancedContent}>
            <p className={styles.advancedHint}>
              Optional identity metadata for the bot user. Leave any field blank
              to omit it from the request.
            </p>

            {/* Name field */}
            <FormField error={errors.metadata?.name?.message}>
              <FormField.Label htmlFor="service-token-meta-name">
                Name
              </FormField.Label>
              <FormField.TextInput
                id="service-token-meta-name"
                placeholder="Human-readable name for the bot user"
                disabled={isDisabled}
                autoComplete="off"
                fullWidth
                {...register('metadata.name')}
              />
            </FormField>

            {/* Email field */}
            <FormField error={errors.metadata?.email?.message}>
              <FormField.Label htmlFor="service-token-meta-email">
                Email
              </FormField.Label>
              <FormField.TextInput
                id="service-token-meta-email"
                placeholder="bot@example.com"
                disabled={isDisabled}
                autoComplete="off"
                fullWidth
                {...register('metadata.email')}
              />
            </FormField>

            {/* UID field */}
            <FormField error={errors.metadata?.uid?.message}>
              <FormField.Label htmlFor="service-token-meta-uid">
                UID
              </FormField.Label>
              <FormField.TextInput
                id="service-token-meta-uid"
                inputMode="numeric"
                placeholder="e.g. 90000"
                disabled={isDisabled}
                autoComplete="off"
                fullWidth
                {...register('metadata.uid', {
                  validate: (value) => validateIdField(value, 'UID') ?? true,
                })}
              />
            </FormField>

            {/* GID field */}
            <FormField error={errors.metadata?.gid?.message}>
              <FormField.Label htmlFor="service-token-meta-gid">
                GID
              </FormField.Label>
              <FormField.TextInput
                id="service-token-meta-gid"
                inputMode="numeric"
                placeholder="e.g. 90001"
                disabled={isDisabled}
                autoComplete="off"
                fullWidth
                {...register('metadata.gid', {
                  validate: (value) => validateIdField(value, 'GID') ?? true,
                })}
              />
            </FormField>

            {/* Groups field */}
            <FormField
              error={errors.metadata?.groups?.message}
              description='One group per line as "name:id" (e.g. g_developers:1001).'
            >
              <FormField.Label htmlFor="service-token-meta-groups">
                Groups
              </FormField.Label>
              <FormField.TextArea
                id="service-token-meta-groups"
                rows={3}
                placeholder={'g_developers:1001\ng_ops:1002'}
                disabled={isDisabled}
                fullWidth
                {...register('metadata.groups', {
                  validate: (value) => validateGroupsField(value) ?? true,
                })}
              />
            </FormField>
          </div>
        </details>
      </div>

      {/* Form actions */}
      <div className={styles.actions}>
        <Button type="submit" loading={isSubmitting} disabled={isDisabled}>
          Create service token
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
