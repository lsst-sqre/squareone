/*
 * The TimesSquarePage is a view into a single Times Square page.
 * It consists of a column with page metadata/settings and another column with
 * the notebook content (NotebookIframe).
 */

import getConfig from 'next/config';
import Head from 'next/head';
import Error from 'next/error';

import useTimesSquarePage from '../../hooks/useTimesSquarePage';
import TimesSquareParameters from '../TimesSquareParameters';

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

  const { title, description } = pageData;

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
        <TimesSquareParameters
          pageData={pageData}
          userParameters={userParameters}
        />
      </div>
    </>
  );
}
