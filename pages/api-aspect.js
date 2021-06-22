import Head from 'next/head';
import getConfig from 'next/config';
import PropTypes from 'prop-types';

const pageDescription =
  'Integrate Rubin data into your analysis tools with APIs.';

export default function ApiAspectPage({ publicRuntimeConfig }) {
  return (
    <>
      <Head>
        <title key="title">APIs | {publicRuntimeConfig.siteName}</title>
        <meta name="description" key="description" content={pageDescription} />
        <meta
          property="og:title"
          key="ogtitle"
          content="Rubin Science Platform APIs"
        />
        <meta
          property="og:description"
          key="ogdescription"
          content={pageDescription}
        />
      </Head>

      <h1>Rubin Science Platform APIs</h1>

      <p>TK</p>
    </>
  );
}

ApiAspectPage.propTypes = {
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
