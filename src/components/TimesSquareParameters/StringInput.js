export default function StringInput({
  paramName,
  paramSchema,
  value,
  onChange,
}) {
  return (
    <input
      type="text"
      id={paramName}
      name={paramName}
      value={value}
      onChange={onChange}
    />
  );
}
