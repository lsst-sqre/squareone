/* Mock log in page */

import PropTypes from 'prop-types';
import getConfig from 'next/config';
import { useState } from 'react';

import sleep from '../lib/utils/sleep';
import { getDevLoginEndpoint } from '../lib/utils/url';
import useCurrentUrl from '../hooks/useCurrentUrl';

export default function Login({ baseUrl }) {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');

  const currentUrl = useCurrentUrl();

  const handleSubmit = (event) => {
    // prevent default behaviour which refreshes the page
    event.preventDefault();
    const body = JSON.stringify({ name, username });
    fetch(getDevLoginEndpoint(currentUrl), {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/json' },
    }).then(sleep(500).then(() => window.location.assign('/')));
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="name">
        Name
        <input
          type="text"
          id="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </label>
      <label htmlFor="username">
        Username:
        <input
          type="text"
          id="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />
      </label>
      <button type="submit">Submit</button>
    </form>
  );
}

Login.propTypes = {};

export async function getServerSideProps() {
  const { serverRuntimeConfig, publicRuntimeConfig } = getConfig();
  return {
    props: {
      serverRuntimeConfig,
      publicRuntimeConfig,
    },
  };
}
