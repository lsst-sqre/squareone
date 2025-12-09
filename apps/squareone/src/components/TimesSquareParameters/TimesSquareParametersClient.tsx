/*
 * Client-only TimesSquareParameters component - uses SWR without SSR conflicts
 * This component handles the useTimesSquarePage hook on the client side only.
 */

import { Button } from '@lsst-sqre/squared';
import Ajv, { type ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import { Field, Formik, type FormikHelpers } from 'formik';
import { useRouter } from 'next/router';
import React, { type ChangeEvent, useEffect, useState } from 'react';
import styled from 'styled-components';
import useTimesSquarePage from '../../hooks/useTimesSquarePage';
import { TimesSquareUrlParametersContext } from '../TimesSquareUrlParametersProvider';
import ParameterInput from './ParameterInput';
import StringInput from './StringInput';

type ParameterSchema = {
  type: string;
  format?: string;
  description: string;
  // biome-ignore lint/suspicious/noExplicitAny: Default values from Times Square JSON schema can be any type
  default?: any;
};

type FormValues = {
  // biome-ignore lint/suspicious/noExplicitAny: Dynamic notebook parameters from Times Square API can be any type
  [key: string]: any;
  tsHideCode: boolean;
};

type InputFactoryProps = {
  paramName: string;
  paramSchema: ParameterSchema;
  // biome-ignore lint/suspicious/noExplicitAny: Parameter values from Times Square API can be any type (string, number, boolean, etc.)
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

export default function TimesSquareParametersClient() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const router = useRouter();

  const { displaySettings, notebookParameters: userParameters } =
    React.useContext(TimesSquareUrlParametersContext);
  const { parameters } = useTimesSquarePage();

  const ajv = new Ajv({ coerceTypes: true });
  addFormats(ajv);

  // Don't render anything until client-side hydration
  if (!isClient) {
    return null;
  }

  // Merge userParameters with defaults
  const initialValues: FormValues = { tsHideCode: false };
  if (parameters) {
    Object.entries(parameters).forEach(([paramName, paramSchemaDef]) => {
      initialValues[paramName] = userParameters[paramName]
        ? userParameters[paramName]
        : // biome-ignore lint/suspicious/noExplicitAny: paramSchemaDef type is unknown from API, needs cast to access optional default property
          (paramSchemaDef as any)?.default;
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
    Object.entries(parameters).forEach(([paramName, paramSchemaDef]) => {
      schemas[paramName] = ajv.compile(paramSchemaDef);
    });
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
      Object.keys(parameters).forEach((paramName) => {
        query[paramName] = values[paramName];
      });
    }

    if (values.tsHideCode) {
      query.ts_hide_code = '1';
    } else {
      query.ts_hide_code = '0';
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
            <Button
              type="reset"
              appearance="outline"
              tone="danger"
              size="sm"
              onClick={handleReset}
              disabled={isSubmitting || !dirty}
            >
              Reset
            </Button>
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
