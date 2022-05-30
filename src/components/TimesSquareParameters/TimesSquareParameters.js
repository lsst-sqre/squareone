import { useRouter } from 'next/router';
import { Formik } from 'formik';
import Ajv from 'ajv';

export default function TimesSquareParameters({ pageData, userParameters }) {
  const router = useRouter();
  const { parameters } = pageData;
  const ajv = new Ajv({ coerceTypes: true });

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

    router.push({ pathname: router.pathname, query: query }, undefined, {
      shallow: true,
    });

    setSubmitting(false);
  };

  // Callback function to handle  form validation.
  const validate = (values) => {
    const errors = {};
    Object.entries(values).forEach(([paramName, value]) => {
      const valid = schemas[paramName](value);
      if (!valid) {
        const error_messages = schemas[paramName].errors.map(
          (error) => error.message
        );
        errors[paramName] = error_messages.join('. ');
      }
    });
    return errors;
  };

  return (
    <Formik
      initialValues={userParameters}
      onSubmit={handleFormSubmit}
      validate={validate}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleSubmit,
        isSubmitting,
      }) => (
        <form onSubmit={handleSubmit}>
          <ul>
            {Object.entries(parameters).map((item) => {
              const paramName = item[0];
              return (
                <li key={paramName}>
                  <label htmlFor={paramName}>
                    {paramName}{' '}
                    <input
                      type="text"
                      id={paramName}
                      name={paramName}
                      value={values[paramName]}
                      onChange={handleChange}
                    />
                    {errors[paramName] && touched[paramName] && (
                      <div>{errors[paramName]}</div>
                    )}
                  </label>
                </li>
              );
            })}
          </ul>
          <button type="submit" disabled={isSubmitting}>
            Update
          </button>
        </form>
      )}
    </Formik>
  );
}
