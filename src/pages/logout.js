/* Mock log out page */

import PropTypes from 'prop-types';
import getConfig from 'next/config';
import sleep from '../lib/utils/sleep';
import { getDevLogoutEndpoint } from '../lib/utils/url';
import useCurrentUrl from '../hooks/useCurrentUrl';

export default function Logout() {
  const currentUrl = useCurrentUrl();

  const handleSubmit = (event) => {
    // prevent default behaviour which refreshes the page
    event.preventDefault();
    fetch(getDevLogoutEndpoint(currentUrl), {
      method: 'POST',
    }).then(sleep(500).then(() => window.location.assign('/')));
  };

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit">Log out</button>
    </form>
  );
}

Logout.propTypes = {};

export async function getServerSideProps() {
  const { serverRuntimeConfig, publicRuntimeConfig } = getConfig();
  return {
    props: {
      serverRuntimeConfig,
      publicRuntimeConfig,
    },
  };
}
