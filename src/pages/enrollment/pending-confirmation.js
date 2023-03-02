import Head from 'next/head';
import getConfig from 'next/config';
import Link from 'next/link';
import PropTypes from 'prop-types';

import MainContent from '../../components/MainContent';
import { Lede } from '../../components/Typography';

export default function PendingVerificationPage({ publicRuntimeConfig }) {
  return (
    <>
      <Head>
        <title key="title">
          Documentation | {publicRuntimeConfig.siteName}
        </title>
        <meta
          name="description"
          key="description"
          content="Your email verification is pending"
        />
        <meta
          property="og:title"
          key="ogtitle"
          content="Please confirm your email"
        />
        <meta
          property="og:description"
          key="ogdescription"
          content="Your email verification is pending"
        />
      </Head>

      <h1>Please confirm your email</h1>

      <Lede>Your email is still pending verification.</Lede>

      <p>
        To complete your enrollment please check the email you registered with
        for a link to verify your email address. Please click on the link to
        verify your email address.
      </p>

      <p>
        If you have not received the confirmation email please check your SPAM
        folder.
      </p>

      <p>
        If you still cannot find the confirmation email please{' '}
        <Link href="../support">
          <a>contact us</a>
        </Link>{' '}
        to have the confirmation email resent.
      </p>
    </>
  );
}

PendingVerificationPage.propTypes = {
  publicRuntimeConfig: PropTypes.object,
};

PendingVerificationPage.getLayout = function getLayout(page) {
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
