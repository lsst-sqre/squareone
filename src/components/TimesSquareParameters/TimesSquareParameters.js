export default function TimesSquareParameters({ pageData, userParameters }) {
  const { parameters } = pageData;

  const parameterInputs = Object.entries(parameters).map((item) => {
    const currentValue =
      item[0] in userParameters ? userParameters[item[0]] : item[1].default;

    return (
      <li key={item[0]}>
        <label htmlFor={item[0]}>
          {item[0]}{' '}
          <input type="text" id={item[0]} name={item[0]} value={currentValue} />
        </label>
      </li>
    );
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = Object.entries(parameters).map((item) => [
      item[0],
      event.target[item[0]].value,
    ]);
    console.log('submitted');
    console.log(formData);
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <ul>{parameterInputs}</ul>
        <button type="submit">Update</button>
      </form>
    </>
  );
}
