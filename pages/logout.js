/* Mock log out page */

import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import sleep from '../utils/sleep';
import { getDevLogoutEndpoint } from '../utils/client/url';

export default function Logout({ baseUrl }) {
  const router = useRouter();
  const currentUrl = new URL(router.pathname, baseUrl);

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

export async function getServerSideProps({ req }) {
  const baseUrl = `http://${req.headers.host}`;
  return {
    props: {
      baseUrl,
    },
  };
}
