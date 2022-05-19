import Head from 'next/head';
import getConfig from 'next/config';
import PropTypes from 'prop-types';
import Link from 'next/link';

import TimesSquareApp from '../../components/TimesSquareApp';
import WideContentLayout from '../../components/WideContentLayout';

const fetcher = (...args) => fetch(...args).then((res) => res.json());

export default function TimesSquareHome({ publicRuntimeConfig }) {
  return (
    <TimesSquareApp>
      <Head>
        <title>Times Square | {publicRuntimeConfig.siteName}</title>
      </Head>
      <h1>Times Square</h1>
      <p>
        View Jupyter Notebooks on the Rubin Science Platform, computed on-demand
        with configurable parameters.
      </p>
    </TimesSquareApp>
  );
}

TimesSquareHome.propTypes = {
  publicRuntimeConfig: PropTypes.object,
};

TimesSquareHome.getLayout = function getLayout(page) {
  return <WideContentLayout>{page}</WideContentLayout>;
};

export async function getServerSideProps() {
  const { serverRuntimeConfig, publicRuntimeConfig } = getConfig();

  // Make the page return a 404 if Times Square is not configured
  const notFound = publicRuntimeConfig.timesSquareUrl ? false : true;

  return {
    notFound,
    props: {
      serverRuntimeConfig,
      publicRuntimeConfig,
    },
  };
}
