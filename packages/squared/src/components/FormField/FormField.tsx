import React from 'react';
import styles from './FormField.module.css';
import ErrorMessage from '../ErrorMessage';
import Label from '../Label';
import { TextInput } from '../TextInput';
import FormFieldContext, { useFormFieldContext } from './FormFieldContext';

export type FormFieldProps = {
  children: React.ReactNode;
  error?: string;
  description?: string;
  required?: boolean;
} & React.ComponentPropsWithoutRef<'div'>;

// Main FormField component
const FormFieldRoot = ({
  children,
  error,
  description,
  required,
  className,
  ...props
}: FormFieldProps) => {
  const fieldId = React.useId();
  const errorId = error ? `${fieldId}-error` : undefined;
  const descriptionId = description ? `${fieldId}-description` : undefined;

  return (
    <FormFieldContext.Provider
      value={{
        error,
        errorId,
        description,
        descriptionId,
        required,
      }}
    >
      <div
        className={[styles.field, className].filter(Boolean).join(' ')}
        {...props}
      >
        {children}
        {description && (
          <span id={descriptionId} className={styles.description}>
            {description}
          </span>
        )}
        <ErrorMessage id={errorId} message={error} />
      </div>
    </FormFieldContext.Provider>
  );
};

// Compound component: Label
const FormFieldLabel = React.forwardRef<
  HTMLLabelElement,
  React.ComponentPropsWithoutRef<typeof Label>
>((props, ref) => {
  const context = useFormFieldContext();
  const required = props.required ?? context?.required;
  return <Label ref={ref} required={required} {...props} />;
});

FormFieldLabel.displayName = 'FormField.Label';

// Compound component: TextInput
const FormFieldTextInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentPropsWithoutRef<typeof TextInput>
>((props, ref) => {
  const context = useFormFieldContext();
  const ariaDescribedBy =
    [context?.errorId, context?.descriptionId, props['aria-describedby']]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <TextInput
      ref={ref}
      aria-invalid={!!context?.error || props['aria-invalid']}
      aria-describedby={ariaDescribedBy}
      {...props}
    />
  );
});

FormFieldTextInput.displayName = 'FormField.TextInput';

// Export compound components
export const FormField = Object.assign(FormFieldRoot, {
  Label: FormFieldLabel,
  TextInput: FormFieldTextInput,
});

export default FormField;
