import Head from 'next/head';
import getConfig from 'next/config';
import PropTypes from 'prop-types';
import Link from 'next/link';

import useSWR from 'swr';

import WideContentLayout from '../../components/WideContentLayout';

const fetcher = (...args) => fetch(...args).then((res) => res.json());

export default function TimesSquareHome({ publicRuntimeConfig }) {
  const { timesSquareUrl } = publicRuntimeConfig;
  const pagesDataUrl = `${timesSquareUrl}/v1/pages`;

  const { data: pageResources, error } = useSWR(pagesDataUrl, fetcher, {});

  if (pageResources) {
    return (
      <>
        <Head>
          <title>{publicRuntimeConfig.siteName}</title>
        </Head>
        <h1>Times Square</h1>
        <p>
          View Jupyter Notebooks on the Rubin Science Platform, computed
          on-demand with configurable parameters.
        </p>
        <h2>Pages</h2>
        <ul>
          {pageResources.map((page) => (
            <li key={page.name}>
              <Link href={`/times-square/nb/${page.name}`}>{page.title}</Link>
            </li>
          ))}
        </ul>
      </>
    );
  } else {
    return (
      <>
        <Head>
          <title>{publicRuntimeConfig.siteName}</title>
        </Head>
        <h1>Times Square</h1>
        <p>Loading...</p>
      </>
    );
  }
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
