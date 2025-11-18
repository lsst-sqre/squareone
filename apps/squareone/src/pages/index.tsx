import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import type { ReactElement, ReactNode } from 'react';
import HomepageHero from '../components/HomepageHero';
import MainContent from '../components/MainContent';
import { useAppConfig } from '../contexts/AppConfigContext';
import { loadAppConfig } from '../lib/config/loader';

// biome-ignore lint/complexity/noBannedTypes: Empty props object required for Next.js page
type HomeProps = {};

export default function Home() {
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
  // Load app configuration for context
  const appConfig = await loadAppConfig();

  return {
    props: {
      appConfig, // Still needed for _app.tsx to extract into context
    },
  };
};
