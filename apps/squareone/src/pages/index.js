import Head from 'next/head';
import getConfig from 'next/config';
import PropTypes from 'prop-types';

import MainContent from '../components/MainContent';
import HomepageHero from '../components/HomepageHero';

export default function Home({ publicRuntimeConfig }) {
  return (
    <>
      <Head>
        <title>{publicRuntimeConfig.siteName}</title>
      </Head>

      <HomepageHero />
    </>
  );
}

Home.propTypes = {
  publicRuntimeConfig: PropTypes.object,
};

Home.getLayout = function getLayout(page) {
  return <MainContent>{page}</MainContent>;
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
