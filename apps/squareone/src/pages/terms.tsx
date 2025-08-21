import Head from 'next/head';
import type { GetServerSideProps } from 'next';
import type { ReactElement, ReactNode } from 'react';

import MainContent from '../components/MainContent';
import { loadAppConfig } from '../lib/config/loader';
import { useAppConfig } from '../contexts/AppConfigContext';

const pageDescription =
  'Learn about the Rubin Science Platform Acceptable Use Policy';

type AupPageProps = {};

export default function AupPage({}: AupPageProps) {
  const appConfig = useAppConfig();

  return (
    <>
      <Head>
        <title key="title">{`Acceptable Use Policy | ${appConfig.siteName}`}</title>
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
        We're giving you access to Rubin Observatory systems so you can do
        science with our data products or otherwise further the mission of the
        Observatory.
      </p>
      <p>
        You can lose your access (even if you have "data rights" to our data
        products) if you misuse our resources, interfere with other users, or
        otherwise do anything that would bring the Observatory into disrepute.
      </p>
      <p>Observatory systems staff have access to all your activity.</p>
    </>
  );
}

AupPage.getLayout = function getLayout(page: ReactElement): ReactNode {
  return <MainContent>{page}</MainContent>;
};

export const getServerSideProps: GetServerSideProps<
  AupPageProps
> = async () => {
  try {
    // Load app configuration for context
    const appConfig = await loadAppConfig();

    return {
      props: {
        appConfig, // Still needed for _app.tsx to extract into context
      },
    };
  } catch (error) {
    throw error;
  }
};
