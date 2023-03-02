import Head from 'next/head';
import getConfig from 'next/config';
import PropTypes from 'prop-types';

import MainContent from '../../components/MainContent';
import { Lede } from '../../components/Typography';

export default function VerifyEmailPage({ publicRuntimeConfig }) {
  return (
    <>
      <Head>
        <title key="title">
          Documentation | {publicRuntimeConfig.siteName}
        </title>
        <meta
          name="description"
          key="description"
          content="Thanks for registering"
        />
        <meta
          property="og:title"
          key="ogtitle"
          content="Thanks for registering"
        />
        <meta
          property="og:description"
          key="ogdescription"
          content="Thanks for registering"
        />
      </Head>

      <h1>Thanks for registering</h1>

      <Lede>
        You'll receive an email from us shortly. Click on the link in the
        message to verify your address and continue your account set up.
      </Lede>
    </>
  );
}

VerifyEmailPage.propTypes = {
  publicRuntimeConfig: PropTypes.object,
};

VerifyEmailPage.getLayout = function getLayout(page) {
  return <MainContent>{page}</MainContent>;
};

export async function getServerSideProps() {
  const { publicRuntimeConfig } = getConfig();
  return {
    props: {
      publicRuntimeConfig,
    },
  };
}
