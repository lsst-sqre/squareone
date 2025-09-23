import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button, FormField } from '@lsst-sqre/squared';
import ScopeSelector, { type Scope } from './ScopeSelector';
import ExpirationSelector from './ExpirationSelector';
import { type ExpirationValue } from '../../lib/tokens/expiration';
import styles from './TokenForm.module.css';

export type TokenFormValues = {
  name: string;
  scopes: string[];
  expiration: ExpirationValue;
};

export type TokenFormProps = {
  availableScopes: Scope[];
  initialValues?: Partial<TokenFormValues>;
  onSubmit: (values: TokenFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
};

export default function TokenForm({
  availableScopes,
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: TokenFormProps) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TokenFormValues>({
    defaultValues: {
      name: initialValues?.name || '',
      scopes: initialValues?.scopes || [],
      expiration: initialValues?.expiration || { type: 'preset', value: '90d' },
    },
  });

  const handleFormSubmit = async (data: TokenFormValues) => {
    try {
      await onSubmit(data);
    } catch (error) {
      // Error handling will be managed by the parent component
      console.error('Form submission error:', error);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(handleFormSubmit)}>
      <div className={styles.formContent}>
        {/* Token Name Field */}
        <FormField error={errors.name?.message} required>
          <FormField.Label htmlFor="token-name">Token name</FormField.Label>
          <FormField.TextInput
            id="token-name"
            placeholder="A descriptive name for your token to help you recognize it later."
            disabled={isSubmitting}
            {...register('name', {
              required: 'Token name is required',
              minLength: {
                value: 1,
                message: 'Token name must not be empty',
              },
              maxLength: {
                value: 64,
                message: 'Token name must be 64 characters or less',
              },
            })}
          />
        </FormField>

        {/* Scopes Field */}
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

        {/* Expiration Field */}
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

      {/* Form Actions */}
      <div className={styles.actions}>
        <Button
          type="submit"
          role="primary"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          Create token
        </Button>
        <Button
          type="button"
          role="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
