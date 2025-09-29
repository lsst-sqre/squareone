import React, { useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button, FormField } from '@lsst-sqre/squared';
import ScopeSelector, { type Scope } from './ScopeSelector';
import ExpirationSelector from './ExpirationSelector';
import { type ExpirationValue } from '../../lib/tokens/expiration';
import useTokenNameValidation from '../../hooks/useTokenNameValidation';
import styles from './TokenForm.module.css';

// Stable empty array to prevent unnecessary re-renders
const EMPTY_TOKEN_NAMES: string[] = [];

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
  existingTokenNames?: string[];
};

export default function TokenForm({
  availableScopes,
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  existingTokenNames = EMPTY_TOKEN_NAMES,
}: TokenFormProps) {
  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TokenFormValues>({
    defaultValues: {
      name: initialValues?.name || '',
      scopes: initialValues?.scopes || [],
      expiration: initialValues?.expiration || { type: 'preset', value: '90d' },
    },
  });

  // Watch the token name for validation (memoized to prevent unnecessary re-renders)
  const watchedTokenName = watch('name');
  const tokenName = useMemo(() => watchedTokenName, [watchedTokenName]);

  // Token name validation
  const nameValidation = useTokenNameValidation(tokenName, existingTokenNames);

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
        <FormField
          error={errors.name?.message || nameValidation.errorMessage}
          required
        >
          <FormField.Label htmlFor="token-name">Token name</FormField.Label>
          <FormField.TextInput
            id="token-name"
            placeholder="A descriptive name for your token to help you recognize it later."
            disabled={isSubmitting}
            autoComplete="off"
            data-1p-ignore
            data-form-type="other"
            onBlur={nameValidation.validateImmediately}
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
          disabled={isSubmitting || !nameValidation.isValid}
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
