/* Mock log out page */

import type { GetServerSideProps } from 'next';
import type { FormEvent, ReactElement, ReactNode } from 'react';
import MainContent from '../components/MainContent';
import type { AppConfigContextValue } from '../contexts/AppConfigContext';
import useCurrentUrl from '../hooks/useCurrentUrl';
import { loadFooterMdx } from '../lib/config/footerLoader';
import { loadAppConfig } from '../lib/config/loader';
import sleep from '../lib/utils/sleep';
import { getDevLogoutEndpoint } from '../lib/utils/url';

export default function Logout() {
  const currentUrl = useCurrentUrl();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    // prevent default behaviour which refreshes the page
    event.preventDefault();
    fetch(getDevLogoutEndpoint(currentUrl), {
      method: 'POST',
    }).then(() => sleep(500).then(() => window.location.assign('/')));
  };

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit">Log out</button>
    </form>
  );
}

Logout.getLayout = function getLayout(page: ReactElement): ReactNode {
  return <MainContent>{page}</MainContent>;
};

type LogoutProps = {
  appConfig: AppConfigContextValue;
};

export const getServerSideProps: GetServerSideProps<LogoutProps> = async () => {
  try {
    const appConfig = await loadAppConfig();
    const footerMdxSource = await loadFooterMdx(appConfig);

    return {
      props: {
        appConfig,
        footerMdxSource,
      },
    };
  } catch (_error) {
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
    const footerMdxSource = await loadFooterMdx(fallbackConfig);

    return {
      props: {
        appConfig: fallbackConfig,
        footerMdxSource,
      },
    };
  }
};
