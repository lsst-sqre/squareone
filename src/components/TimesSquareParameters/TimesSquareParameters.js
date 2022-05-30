import { useRouter } from 'next/router';
import { Formik } from 'formik';

export default function TimesSquareParameters({ pageData, userParameters }) {
  const router = useRouter();
  const { parameters } = pageData;

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

  return (
    <Formik initialValues={userParameters} onSubmit={handleFormSubmit}>
      {({ values, handleChange, handleSubmit, isSubmitting }) => (
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
