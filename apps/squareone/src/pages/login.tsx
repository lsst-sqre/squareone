/* Mock log in page */

import { useState, FormEvent } from 'react';
import type { GetServerSideProps } from 'next';
import type { ReactElement, ReactNode, ChangeEvent } from 'react';

import sleep from '../lib/utils/sleep';
import { getDevLoginEndpoint } from '../lib/utils/url';
import useCurrentUrl from '../hooks/useCurrentUrl';
import { loadAppConfig } from '../lib/config/loader';
import type { AppConfigContextValue } from '../contexts/AppConfigContext';

import MainContent from '../components/MainContent';

export default function Login() {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');

  const currentUrl = useCurrentUrl();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    // prevent default behaviour which refreshes the page
    event.preventDefault();
    const body = JSON.stringify({ name, username });
    fetch(getDevLoginEndpoint(currentUrl), {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/json' },
    }).then(() => sleep(500).then(() => window.location.assign('/')));
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="name">
        Name
        <input
          type="text"
          id="name"
          value={name}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            setName(event.target.value)
          }
        />
      </label>
      <label htmlFor="username">
        Username:
        <input
          type="text"
          id="username"
          value={username}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            setUsername(event.target.value)
          }
        />
      </label>
      <button type="submit">Submit</button>
    </form>
  );
}

Login.getLayout = function getLayout(page: ReactElement): ReactNode {
  return <MainContent>{page}</MainContent>;
};

type LoginProps = {
  appConfig: AppConfigContextValue;
};

export const getServerSideProps: GetServerSideProps<LoginProps> = async () => {
  try {
    const appConfig = await loadAppConfig();

    return {
      props: {
        appConfig,
      },
    };
  } catch (error) {
    // Return a fallback config if loading fails
    const fallbackConfig: AppConfigContextValue = {
      siteName: 'Rubin Science Platform',
      baseUrl: 'http://localhost:3000',
      environmentName: 'development',
      siteDescription: 'Welcome to the Rubin Science Platform',
      docsBaseUrl: 'https://rsp.lsst.io',
      timesSquareUrl: '',
      coManageRegistryUrl: '',
      enableAppsMenu: false,
      appLinks: [],
      showPreview: false,
      mdxDir: 'src/content/pages',
    };

    return {
      props: {
        appConfig: fallbackConfig,
      },
    };
  }
};
