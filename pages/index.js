import Head from 'next/head';
import getConfig from 'next/config';
import PropTypes from 'prop-types';

import { useCurrentUrl } from '../hooks/currentUrl';

import { Login } from '../components/login';

export default function Home({ publicRuntimeConfig, loginData, baseUrl }) {
  const currentUrl = useCurrentUrl(baseUrl);

  return (
    <>
      <Head>
        <title>{publicRuntimeConfig.siteName}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1>{publicRuntimeConfig.siteName}</h1>

      <Login loginData={loginData} pageUrl={currentUrl} />
    </>
  );
}

Home.propTypes = {
  publicRuntimeConfig: PropTypes.object,
  loginData: PropTypes.object.isRequired,
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
