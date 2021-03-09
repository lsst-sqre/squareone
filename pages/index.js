import Head from 'next/head';
import getConfig from 'next/config';
import PropTypes from 'prop-types';

export default function Home({ publicRuntimeConfig }) {
  return (
    <>
      <Head>
        <title>{publicRuntimeConfig.siteName}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1>{publicRuntimeConfig.siteName}</h1>
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
