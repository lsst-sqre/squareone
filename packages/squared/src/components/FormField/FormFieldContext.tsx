'use client';

import { createContext, useContext } from 'react';

type FormFieldContextValue = {
  error?: string;
  errorId?: string;
  description?: string;
  descriptionId?: string;
  required?: boolean;
};

const FormFieldContext = createContext<FormFieldContextValue | undefined>(
  undefined
);

export const useFormFieldContext = () => {
  const context = useContext(FormFieldContext);
  // Context is optional - components can be used standalone
  return context;
};

export default FormFieldContext;
