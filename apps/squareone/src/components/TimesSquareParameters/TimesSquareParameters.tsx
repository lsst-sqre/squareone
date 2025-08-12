import React, { ChangeEvent } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { Formik, Field, FormikHelpers } from 'formik';
import Ajv, { ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';

import Button, { RedGhostButton } from '../Button';
import StringInput from './StringInput';
import ParameterInput from './ParameterInput';

import { TimesSquareUrlParametersContext } from '../TimesSquareUrlParametersProvider';
import useTimesSquarePage from '../../hooks/useTimesSquarePage';

type ParameterSchema = {
  type: string;
  format?: string;
  description: string;
  default?: any;
};

type Parameters = {
  [key: string]: ParameterSchema;
} | null;

type FormValues = {
  [key: string]: any;
  tsHideCode: boolean;
};

type InputFactoryProps = {
  paramName: string;
  paramSchema: ParameterSchema;
  value: any;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  errors?: string;
  touched?: boolean;
};

// Create input components based on the parameter's JSON schema
function inputFactory(props: InputFactoryProps) {
  const { paramName, paramSchema, value, onChange, errors, touched } = props;
  return (
    <ParameterInput
      paramName={paramName}
      paramSchema={paramSchema}
      touched={touched}
      errors={errors}
    >
      <StringInput
        paramName={paramName}
        value={value}
        onChange={onChange}
        isError={!!errors}
      />
    </ParameterInput>
  );
}

export default function TimesSquareParameters() {
  const router = useRouter();

  const { displaySettings, notebookParameters: userParameters } =
    React.useContext(TimesSquareUrlParametersContext);
  const { parameters } = useTimesSquarePage();

  const ajv = new Ajv({ coerceTypes: true });
  addFormats(ajv);

  // Merge userParameters with defaults
  const initialValues: FormValues = { tsHideCode: false };
  if (parameters) {
    Object.entries(parameters).forEach(([paramName, paramSchemaDef]) => {
      initialValues[paramName] = userParameters[paramName]
        ? userParameters[paramName]
        : (paramSchemaDef as any)?.default;
    });
  }

  if (displaySettings.ts_hide_code === '1') {
    initialValues.tsHideCode = true;
  } else {
    initialValues.tsHideCode = false;
  }

  // Prepare executable validators for each parameter from their
  // JSON schema definitions.
  const schemas: { [key: string]: ValidateFunction } = {};
  if (parameters) {
    Object.entries(parameters).forEach(
      ([paramName, paramSchemaDef]) =>
        (schemas[paramName] = ajv.compile(paramSchemaDef))
    );
  }

  // Callback function to handle form submission by "navigating"
  // to a new set of query parameters.
  const handleFormSubmit = (
    values: FormValues,
    { setSubmitting }: FormikHelpers<FormValues>
  ) => {
    // 1. Get an object with the existing query from the router. This gives us
    // any existing path parameters for dynamic routing or misc query parameters
    // unrelated to page parameters.
    const query = Object.assign({}, router.query);

    // 2. Update object with form's `values`
    if (parameters) {
      Object.keys(parameters).forEach(
        (paramName) => (query[paramName] = values[paramName])
      );
    }

    if (values.tsHideCode) {
      query['ts_hide_code'] = '1';
    } else {
      query['ts_hide_code'] = '0';
    }

    router.push({ pathname: router.pathname, query: query }, undefined, {
      shallow: true,
    });

    setSubmitting(false);
  };

  // Callback function to handle  form validation.
  const validate = (values: FormValues) => {
    const errors: { [key: string]: string } = {};
    Object.entries(schemas).forEach(([paramName, schema]) => {
      const valid = schema(values[paramName]);
      if (!valid) {
        const error_messages =
          schema.errors?.map((error) => error.message) || [];
        errors[paramName] = error_messages.join('. ');
      }
    });
    return errors;
  };

  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      onSubmit={handleFormSubmit}
      validate={validate}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleSubmit,
        handleReset,
        isSubmitting,
        dirty,
      }) => (
        <form onSubmit={handleSubmit} onReset={handleReset}>
          <StyledParameterList>
            {parameters &&
              Object.entries(parameters).map(([paramName, paramSchema]) => {
                const inputProps: InputFactoryProps = {
                  paramName,
                  paramSchema: paramSchema as ParameterSchema,
                  value: values[paramName],
                  touched: !!touched[paramName],
                  onChange: handleChange,
                  errors:
                    typeof errors[paramName] === 'string'
                      ? errors[paramName]
                      : undefined,
                };
                return <li key={paramName}>{inputFactory(inputProps)}</li>;
              })}
          </StyledParameterList>
          <StyledParameterList>
            <li>
              <CheckboxLabel htmlFor="tsHideCode">
                <Field type="checkbox" name="tsHideCode" />
                <span className="label">Hide code cells</span>
              </CheckboxLabel>
            </li>
          </StyledParameterList>
          <ButtonGroup>
            <Button type="submit" disabled={isSubmitting || !dirty}>
              Update
            </Button>
            <ResetButton
              type="reset"
              onClick={handleReset}
              disabled={isSubmitting || !dirty}
            >
              Reset
            </ResetButton>
          </ButtonGroup>
        </form>
      )}
    </Formik>
  );
}

const CheckboxLabel = styled.label`
  display: flex;
  flex-direction: row;
  gap: var(--sqo-space-xs);
  align-items: baseline;
`;

const StyledParameterList = styled.ul`
  list-style: none;
  padding-left: 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const ResetButton = styled(RedGhostButton)`
  font-size: 0.8rem;
`;
