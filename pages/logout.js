/* Mock log out page */

import PropTypes from 'prop-types';
import getConfig from 'next/config';
import sleep from '../utils/sleep';
import { getDevLogoutEndpoint } from '../utils/client/url';
import { useCurrentUrl } from '../hooks/currentUrl';

export default function Logout({ baseUrl }) {
  const currentUrl = useCurrentUrl(baseUrl);

  const handleSubmit = (event) => {
    // prevent default behaviour which refreshes the page
    event.preventDefault();
    fetch(getDevLogoutEndpoint(currentUrl), {
      method: 'POST',
    })
      .then((response) => console.log(response))
      .then(sleep(100).then(() => window.location.assign('/')));
  };

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit">Log out</button>
    </form>
  );
}

Logout.propTypes = {
  baseUrl: PropTypes.string,
};

export async function getServerSideProps() {
  const { serverRuntimeConfig, publicRuntimeConfig } = getConfig();
  return {
    props: {
      serverRuntimeConfig,
      publicRuntimeConfig,
    },
  };
}
