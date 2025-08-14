/* Mock log out page */

import getConfig from 'next/config';
import type { GetServerSideProps } from 'next';
import type { ReactElement, ReactNode, FormEvent } from 'react';
import sleep from '../lib/utils/sleep';
import { getDevLogoutEndpoint } from '../lib/utils/url';
import useCurrentUrl from '../hooks/useCurrentUrl';

import MainContent from '../components/MainContent';

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

export const getServerSideProps: GetServerSideProps = async () => {
  const { serverRuntimeConfig, publicRuntimeConfig } = getConfig();
  return {
    props: {
      serverRuntimeConfig,
      publicRuntimeConfig,
    },
  };
};
