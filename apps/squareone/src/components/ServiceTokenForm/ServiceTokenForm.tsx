import { Button, FormField } from '@lsst-sqre/squared';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { validateBotUsername } from '../../lib/tokens/botUsername';
import type { ExpirationValue } from '../../lib/tokens/expiration';
import { ExpirationSelector, type Scope, ScopeSelector } from '../TokenForm';
import styles from './ServiceTokenForm.module.css';

export type ServiceTokenFormValues = {
  username: string;
  name: string;
  scopes: string[];
  expiration: ExpirationValue;
};

export type ServiceTokenFormProps = {
  /**
   * The full set of scopes that can be granted to a service token. An
   * `admin:token` holder may grant any configured scope, so this should be the
   * complete `loginInfo.config.scopes` list rather than the admin's own scopes.
   */
  availableScopes: Scope[];
  initialValues?: Partial<ServiceTokenFormValues>;
  onSubmit: (values: ServiceTokenFormValues) => Promise<void>;
  isSubmitting?: boolean;
};

/**
 * Form for creating a Gafaelfawr service token for a `bot-` user.
 *
 * Mirrors {@link TokenForm} but adds a bot-username field (validated against the
 * Gafaelfawr username rules via {@link validateBotUsername}) and defaults the
 * expiration to "never". The scope picker is fed the full configured scope list
 * because an `admin:token` holder can grant any scope to a service token.
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
  } = useForm<ServiceTokenFormValues>({
    defaultValues: {
      username: initialValues?.username || '',
      name: initialValues?.name || '',
      scopes: initialValues?.scopes || [],
      expiration: initialValues?.expiration || { type: 'never' },
    },
  });

  const handleFormSubmit = async (data: ServiceTokenFormValues) => {
    try {
      await onSubmit(data);
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
