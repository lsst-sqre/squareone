import Head from 'next/head';
import getConfig from 'next/config';
import Link from 'next/link';
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
          content="Your account is pending approval"
        />
        <meta property="og:title" key="ogtitle" content="Approval pending" />
        <meta
          property="og:description"
          key="ogdescription"
          content="Your account is pending approval"
        />
      </Head>

      <h1>Your account is pending approval</h1>

      <Lede>Requests are typically processed within five business days.</Lede>

      <p>
        Once your account is approved, you’ll receive an email at the address
        you registered with.
      </p>

      <p>
        <Link href="../support">
          <a>Contact us</a>
        </Link>{' '}
        if you have further questions.
      </p>
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
