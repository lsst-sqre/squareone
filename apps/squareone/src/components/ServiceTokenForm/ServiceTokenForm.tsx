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
  name: string;
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

export type ServiceTokenFormProps = {
  /**
   * The full set of scopes that can be granted to a service token. An
   * `admin:token` holder may grant any configured scope, so this should be the
   * complete `loginInfo.config.scopes` list rather than the admin's own scopes.
   */
  availableScopes: Scope[];
  initialValues?: Partial<Omit<ServiceTokenFormValues, 'metadata'>>;
  onSubmit: (values: ServiceTokenFormValues) => Promise<void>;
  isSubmitting?: boolean;
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
 * A collapsible "Advanced metadata" section (collapsed by default) collects the
 * optional `name`/`email`/`uid`/`gid`/`groups` identity fields. Only the values
 * that are actually supplied are forwarded in the submitted `metadata` object.
 */
export default function ServiceTokenForm({
  availableScopes,
  initialValues,
  onSubmit,
  isSubmitting = false,
}: ServiceTokenFormProps) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ServiceTokenFormFields>({
    defaultValues: {
      username: initialValues?.username || '',
      name: initialValues?.name || '',
      scopes: initialValues?.scopes || [],
      expiration: initialValues?.expiration || { type: 'never' },
      metadata: EMPTY_METADATA_INPUT,
    },
  });

  const handleFormSubmit = async (data: ServiceTokenFormFields) => {
    try {
      await onSubmit({
        username: data.username,
        name: data.name,
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
            disabled={isSubmitting}
            autoComplete="off"
            data-1p-ignore
            data-form-type="other"
            {...register('username', {
              validate: (value) => validateBotUsername(value) ?? true,
            })}
          />
        </FormField>

        {/* Token name field */}
        <FormField error={errors.name?.message} required>
          <FormField.Label htmlFor="service-token-name">
            Token name
          </FormField.Label>
          <FormField.TextInput
            id="service-token-name"
            placeholder="A descriptive name to recognize this token later."
            disabled={isSubmitting}
            autoComplete="off"
            data-1p-ignore
            data-form-type="other"
            {...register('name', {
              required: 'Token name is required',
              maxLength: {
                value: 64,
                message: 'Token name must be 64 characters or less',
              },
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
                disabled={isSubmitting}
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
              disabled={isSubmitting}
              name="expiration"
              required
            />
          )}
        />

        {/* Advanced metadata (collapsed by default) */}
        <details className={styles.advanced}>
          <summary className={styles.advancedSummary}>
            Advanced metadata
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
                disabled={isSubmitting}
                autoComplete="off"
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
                disabled={isSubmitting}
                autoComplete="off"
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
                disabled={isSubmitting}
                autoComplete="off"
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
                disabled={isSubmitting}
                autoComplete="off"
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
                disabled={isSubmitting}
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
        <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
          Create service token
        </Button>
      </div>
    </form>
  );
}
