import Head from 'next/head';
import getConfig from 'next/config';
import PropTypes from 'prop-types';

const pageDescription =
  'Get help with the Rubin Science Platform, data, and software.';

export default function SupportPage({ publicRuntimeConfig }) {
  return (
    <>
      <Head>
        <title key="title">Get help | {publicRuntimeConfig.siteName}</title>
        <meta name="description" key="description" content={pageDescription} />
        <meta property="og:title" key="ogtitle" content="Get help" />
        <meta
          property="og:description"
          key="ogdescription"
          content={pageDescription}
        />
      </Head>

      <h1>Get help with the Rubin Science Platform</h1>

      <p>TK</p>
    </>
  );
}

SupportPage.propTypes = {
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
