import { useRouter } from 'next/router';
import styled from 'styled-components';
import { Formik, Field } from 'formik';
import Ajv from 'ajv';

import Button, { RedGhostButton } from '../Button';
import StringInput from './StringInput';
import ParameterInput from './ParameterInput';

// Create input components based on the parameter's JSON schema
function inputFactory(props) {
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
        paramSchema={paramSchema}
        value={value}
        onChange={onChange}
        isError={errors}
      />
    </ParameterInput>
  );
}

export default function TimesSquareParameters({
  pageData,
  userParameters,
  displaySettings,
}) {
  const router = useRouter();
  const { parameters } = pageData;
  const ajv = new Ajv({ coerceTypes: true });

  // Merge userParameters with defaults
  const initialValues = {};
  Object.entries(parameters).forEach(([paramName, paramSchemaDef]) => {
    initialValues[paramName] = userParameters[paramName]
      ? userParameters[paramName]
      : paramSchemaDef.default;
  });

  if (displaySettings.ts_hide_code === '1') {
    initialValues.tsHideCode = true;
  } else {
    initialValues.tsHideCode = false;
  }

  // Prepare executable validators for each parameter from their
  // JSON schema definitions.
  const schemas = {};
  Object.entries(parameters).forEach(
    ([paramName, paramSchemaDef]) =>
      (schemas[paramName] = ajv.compile(paramSchemaDef))
  );

  // Callback function to handle form submission by "navigating"
  // to a new set of query parameters.
  const handleFormSubmit = (values, { setSubmitting }) => {
    // 1. Get an object with the existing query from the router. This gives us
    // any existing path parameters for dynamic routing or misc query parameters
    // unrelated to page parameters.
    const query = Object.assign({}, router.query);

    // 2. Update object with form's `values`
    Object.keys(parameters).forEach(
      (paramName) => (query[paramName] = values[paramName])
    );

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
  const validate = (values) => {
    const errors = {};
    Object.entries(schemas).forEach(([paramName, schema]) => {
      const valid = schema(values[paramName]);
      if (!valid) {
        const error_messages = schema.errors.map((error) => error.message);
        errors[paramName] = error_messages.join('. ');
      }
    });
    return errors;
  };

  return (
    <Formik
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
      }) => (
        <form onSubmit={handleSubmit} onReset={handleReset}>
          <StyledParameterList>
            {Object.entries(parameters).map(([paramName, paramSchema]) => {
              const inputProps = {
                paramName,
                paramSchema,
                value: values[paramName],
                touched: touched[paramName],
                onChange: handleChange,
                errors: errors[paramName],
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
            <Button type="submit" disabled={isSubmitting}>
              Update
            </Button>
            <ResetButton
              type="reset"
              onClick={handleReset}
              disabled={isSubmitting}
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
