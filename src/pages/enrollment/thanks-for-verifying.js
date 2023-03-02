import Head from 'next/head';
import getConfig from 'next/config';
import PropTypes from 'prop-types';

import MainContent from '../../components/MainContent';
import { Lede } from '../../components/Typography';

export default function PendingApprovalPage({ publicRuntimeConfig }) {
  return (
    <>
      <Head>
        <title key="title">
          Documentation | {publicRuntimeConfig.siteName}
        </title>
        <meta
          name="description"
          key="description"
          content="Your email is verified"
        />
        <meta
          property="og:title"
          key="ogtitle"
          content="Your email is verified"
        />
        <meta
          property="og:description"
          key="ogdescription"
          content="Your email is verified"
        />
      </Head>

      <h1>Your email is verified</h1>

      <Lede>
        We are reviewing your application. You’ll receive an email as soon as
        your account is approved.
      </Lede>
    </>
  );
}

PendingApprovalPage.propTypes = {
  publicRuntimeConfig: PropTypes.object,
};

PendingApprovalPage.getLayout = function getLayout(page) {
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
