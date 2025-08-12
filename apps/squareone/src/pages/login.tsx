/* Mock log in page */

import getConfig from 'next/config';
import { useState, FormEvent } from 'react';
import type { GetServerSideProps } from 'next';
import type { ReactElement, ReactNode, ChangeEvent } from 'react';

import sleep from '../lib/utils/sleep';
import { getDevLoginEndpoint } from '../lib/utils/url';
import useCurrentUrl from '../hooks/useCurrentUrl';

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

export const getServerSideProps: GetServerSideProps = async () => {
  const { serverRuntimeConfig, publicRuntimeConfig } = getConfig();
  return {
    props: {
      serverRuntimeConfig,
      publicRuntimeConfig,
    },
  };
};
