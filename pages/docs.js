import Head from 'next/head';
import getConfig from 'next/config';
import PropTypes from 'prop-types';

const pageDescription =
  'Find documentation for Rubin Observatory data, science platform services, and software.';

export default function DocsPage({ publicRuntimeConfig }) {
  return (
    <>
      <Head>
        <title key="title">
          Documentation | {publicRuntimeConfig.siteName}
        </title>
        <meta name="description" key="description" content={pageDescription} />
        <meta property="og:title" key="ogtitle" content="Documentation" />
        <meta
          property="og:description"
          key="ogdescription"
          content={pageDescription}
        />
      </Head>

      <h1>Rubin Science Platform documentation</h1>

      <h2>Data documentation</h2>

      <h3>Data Preview 0.1 (DP0.1)</h3>
      <p>Description</p>

      <h2>Science platform documentation</h2>

      <h3>Portal</h3>
      <p>Description</p>

      <h3>Notebook</h3>
      <p>Description</p>

      <h3>APIs</h3>
      <p>Description</p>

      <h2>Software documentation</h2>

      <h3>LSST Science Pipelines</h3>
      <p>Description</p>

      <h2>Still need help?</h2>
      <p>TK</p>
    </>
  );
}

DocsPage.propTypes = {
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
