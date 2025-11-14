import React from 'react';
import { Checkbox } from '../Checkbox';
import { CheckboxGroup } from '../CheckboxGroup';
import ErrorMessage from '../ErrorMessage';
import Label from '../Label';
import RadioGroup from '../RadioGroup';
import { Select } from '../Select';
import TextArea from '../TextArea';
import { TextInput } from '../TextInput';
import styles from './FormField.module.css';
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

// Compound component: TextArea
const FormFieldTextArea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentPropsWithoutRef<typeof TextArea>
>((props, ref) => {
  const context = useFormFieldContext();
  const ariaDescribedBy =
    [context?.errorId, context?.descriptionId, props['aria-describedby']]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <TextArea
      ref={ref}
      aria-invalid={!!context?.error || props['aria-invalid']}
      aria-describedby={ariaDescribedBy}
      {...props}
    />
  );
});

FormFieldTextArea.displayName = 'FormField.TextArea';

// Compound component: RadioGroup
const FormFieldRadioGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof RadioGroup>
>((props, ref) => {
  const context = useFormFieldContext();
  const ariaDescribedBy =
    [context?.errorId, context?.descriptionId, props['aria-describedby']]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <RadioGroup
      ref={ref}
      aria-invalid={!!context?.error || props['aria-invalid']}
      aria-describedby={ariaDescribedBy}
      {...props}
    />
  );
});

FormFieldRadioGroup.displayName = 'FormField.RadioGroup';

// Compound component: Checkbox
const FormFieldCheckbox = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof Checkbox>
>((props, ref) => {
  const context = useFormFieldContext();
  const ariaDescribedBy =
    [context?.errorId, context?.descriptionId, props['aria-describedby']]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <Checkbox
      ref={ref}
      aria-invalid={!!context?.error || props['aria-invalid']}
      aria-describedby={ariaDescribedBy}
      {...props}
    />
  );
});

FormFieldCheckbox.displayName = 'FormField.Checkbox';

// Compound component: CheckboxGroup
const FormFieldCheckboxGroup = React.forwardRef<
  HTMLFieldSetElement,
  React.ComponentPropsWithoutRef<typeof CheckboxGroup>
>((props, ref) => {
  const context = useFormFieldContext();
  const ariaDescribedBy =
    [context?.errorId, context?.descriptionId, props['aria-describedby']]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <CheckboxGroup
      ref={ref}
      aria-invalid={!!context?.error || props['aria-invalid']}
      aria-describedby={ariaDescribedBy}
      {...props}
    />
  );
});

FormFieldCheckboxGroup.displayName = 'FormField.CheckboxGroup';

// Compound component: Select
const FormFieldSelect = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof Select> & {
    'aria-describedby'?: string;
    'aria-invalid'?: boolean | 'false' | 'true';
  }
>((props, ref) => {
  const context = useFormFieldContext();
  const ariaDescribedBy =
    [context?.errorId, context?.descriptionId, props['aria-describedby']]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <Select
      ref={ref}
      aria-invalid={!!context?.error || props['aria-invalid']}
      aria-describedby={ariaDescribedBy}
      {...props}
    />
  );
});

FormFieldSelect.displayName = 'FormField.Select';

// Export compound components
export const FormField = Object.assign(FormFieldRoot, {
  Label: FormFieldLabel,
  TextInput: FormFieldTextInput,
  TextArea: FormFieldTextArea,
  RadioGroup: FormFieldRadioGroup,
  Checkbox: FormFieldCheckbox,
  CheckboxGroup: FormFieldCheckboxGroup,
  Select: FormFieldSelect,
});

export default FormField;
