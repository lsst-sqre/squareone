import Head from 'next/head';
import type { GetServerSideProps } from 'next';
import type { ReactElement, ReactNode } from 'react';

import MainContent from '../components/MainContent';
import HomepageHero from '../components/HomepageHero';
import { loadAppConfig } from '../lib/config/loader';
import { useAppConfig } from '../contexts/AppConfigContext';

type HomeProps = {};

export default function Home({}: HomeProps) {
  const appConfig = useAppConfig();

  return (
    <>
      <Head>
        <title>{appConfig.siteName}</title>
      </Head>

      <HomepageHero />
    </>
  );
}

Home.getLayout = function getLayout(page: ReactElement): ReactNode {
  return <MainContent>{page}</MainContent>;
};

export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
  try {
    // Load app configuration for context
    const appConfig = await loadAppConfig();

    return {
      props: {
        appConfig, // Still needed for _app.tsx to extract into context
      },
    };
  } catch (error) {
    console.error('Failed to load home page configuration:', error);

    // This should not happen in normal operation, but provide basic fallback
    throw error;
  }
};
