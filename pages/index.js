import Head from 'next/head';
import getConfig from 'next/config';
import PropTypes from 'prop-types';

import Hero from '../components/hero';

export default function Home({ publicRuntimeConfig }) {
  return (
    <>
      <Head>
        <title>{publicRuntimeConfig.siteName}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Hero />

      <h2>News</h2>
      <p>Hello world.</p>
    </>
  );
}

Home.propTypes = {
  publicRuntimeConfig: PropTypes.object,
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
