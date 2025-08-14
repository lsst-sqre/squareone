import Head from 'next/head';
import getConfig from 'next/config';
import type { GetServerSideProps } from 'next';
import type { ReactElement, ReactNode } from 'react';

import MainContent from '../components/MainContent';
import HomepageHero from '../components/HomepageHero';

type HomeProps = {
  publicRuntimeConfig: any;
};

export default function Home({ publicRuntimeConfig }: HomeProps) {
  return (
    <>
      <Head>
        <title>{publicRuntimeConfig.siteName}</title>
      </Head>

      <HomepageHero />
    </>
  );
}

Home.getLayout = function getLayout(page: ReactElement): ReactNode {
  return <MainContent>{page}</MainContent>;
};

export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
  const { serverRuntimeConfig, publicRuntimeConfig } = getConfig();
  return {
    props: {
      serverRuntimeConfig,
      publicRuntimeConfig,
    },
  };
};
