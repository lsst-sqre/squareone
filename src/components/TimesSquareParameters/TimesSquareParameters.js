export default function TimesSquareParameters({ pageData, userParameters }) {
  const { parameters } = pageData;

  // Merge user-set parameters with defaults
  const updatedParameters = Object.entries(parameters).map((item) => {
    if (item[0] in userParameters) {
      return [item[0], userParameters[item[0]]];
    } else {
      return [item[0], item[1].default];
    }
  });

  // List items for the parameters
  const parameterListItems = updatedParameters.map((item) => (
    <li key={item[0]}>{`${item[0]}: ${item[1]}`}</li>
  ));

  return (
    <>
      <p>Parameters:</p>
      <ul>{parameterListItems}</ul>
    </>
  );
}
