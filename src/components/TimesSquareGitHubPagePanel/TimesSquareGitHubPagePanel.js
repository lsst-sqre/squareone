/*
 * The TimesSquarePage is a view into a single Times Square page.
 * It consists of a column with page metadata/settings and another column with
 * the notebook content (NotebookIframe).
 */

import getConfig from 'next/config';
import Head from 'next/head';
import Error from 'next/error';

import useTimesSquarePage from '../../hooks/useTimesSquarePage';

export default function TimesSquareGitHubPagePanel({
  tsPageUrl,
  userParameters,
}) {
  const { publicRuntimeConfig } = getConfig();
  const pageData = useTimesSquarePage(tsPageUrl);

  if (pageData.loading) {
    return <p>Loading...</p>;
  }
  if (pageData.error) {
    return <Error statusCode={404} />;
  }

  const { parameters, title, description } = pageData;

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
      <Head>
        <title>{`${title} | ${publicRuntimeConfig.siteName}`}</title>
      </Head>
      <div>
        <h1>{title}</h1>
        {description && (
          <div dangerouslySetInnerHTML={{ __html: description.html }}></div>
        )}
        <p>Notebook parameters:</p>
        <ul>{parameterListItems}</ul>
      </div>
    </>
  );
}
