import Head from 'next/head';
import getConfig from 'next/config';
import PropTypes from 'prop-types';

const pageDescription =
  'Learn about the Rubin Science Platform Acceptable Use Policy';

export default function AupPage({ publicRuntimeConfig }) {
  return (
    <>
      <Head>
        <title key="title">
          Acceptable Use Policy | {publicRuntimeConfig.siteName}
        </title>
        <meta name="description" key="description" content={pageDescription} />
        <meta
          property="og:title"
          key="ogtitle"
          content="Acceptable Use Policy"
        />
        <meta
          property="og:description"
          key="ogdescription"
          content={pageDescription}
        />
      </Head>

      <h1>Acceptable Use Policy</h1>

      <p>
        We’re giving you access to Rubin Observatory systems so you can do
        science with our data products or otherwise further the mission of the
        observatory.
      </p>
      <p>
        You can lose your access (even if you have “data rights” to our data
        products) if you misuse our resources, interfere with other users, or
        otherwise do anything that would bring the observatory into disrepute.
      </p>
      <p>Observatory systems staff have access to all your activity.</p>
    </>
  );
}

AupPage.propTypes = {
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
