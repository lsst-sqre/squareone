/*
 * The TimesSquarePage is a view into a single Times Square page.
 * It consists of a column with page metadata/settings and another column with
 * the notebook content (NotebookIframe).
 */

import styled from 'styled-components';
import getConfig from 'next/config';
import Error from 'next/error';
import useSWR from 'swr';

import NotebookIframe from './NotebookIframe';

const PageLayout = styled.div`
  display: flex;
  flex-direction: row;
  min-width: 100%;
  // FIXME need a more reliable of making the viewer use all whitespace
  height: calc(100vh - 200px);
`;

const SettingsContainer = styled.div`
  flex: 0 0 auto;
  width: 18rem;
`;

const NotebookPageContainer = styled.div`
  // border: 1px solid red;
  width: 100%;

  iframe {
    --shadow-color: 0deg 0% 74%;
    --shadow-elevation-medium: 0.1px 0.7px 0.9px hsl(var(--shadow-color) / 0.16),
      0.4px 2.4px 3px -0.6px hsl(var(--shadow-color) / 0.2),
      0.8px 5.3px 6.7px -1.1px hsl(var(--shadow-color) / 0.24),
      1.9px 11.9px 15px -1.7px hsl(var(--shadow-color) / 0.28);
    border: 0px solid black;
    box-shadow: var(--shadow-elevation-medium);
    width: 100%;
    height: 100%;
  }
`;

const fetcher = (...args) => fetch(...args).then((res) => res.json());

export default function TimesSquarePage({ name, userParameters }) {
  // Get data about the page itself
  const { publicRuntimeConfig } = getConfig();
  const { timesSquareUrl } = publicRuntimeConfig;
  const pageDataUrl = `${timesSquareUrl}/v1/pages/${name}`;

  const { data, error } = useSWR(pageDataUrl, fetcher, {});

  if (data) {
    const {
      parameters,
      title,
      description,
      html_url: htmlApiUrl,
      html_status_url: htmlStatusApiUrl,
    } = data;

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
      <PageLayout>
        <SettingsContainer>
          <h1>{title}</h1>
          {description && (
            <div dangerouslySetInnerHTML={{ __html: description.html }}></div>
          )}
          <p>Notebook parameters:</p>
          <ul>{parameterListItems}</ul>
        </SettingsContainer>
        <NotebookPageContainer>
          <NotebookIframe
            tsHtmlUrl={htmlApiUrl}
            tsHtmlStatusUrl={htmlStatusApiUrl}
            parameters={updatedParameters}
          />
        </NotebookPageContainer>
      </PageLayout>
    );
  } else if (!error) {
    return <p>Loading...</p>;
  } else {
    return <Error statusCode={404} />;
  }
}
