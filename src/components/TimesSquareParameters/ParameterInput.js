export default function ParameterInput({
  children,
  paramName,
  paramSchema,
  touched,
  errors,
}) {
  return (
    <>
      <label htmlFor={paramName}>
        <p>{paramName}</p>
        {children}
        {errors && touched && <div>{errors}</div>}
        <p>{paramSchema.description}</p>
      </label>
    </>
  );
}
