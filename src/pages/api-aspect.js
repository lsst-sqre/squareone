import Head from 'next/head';
import getConfig from 'next/config';
import PropTypes from 'prop-types';

import { Lede } from '../components/Typography';
import MainContent from '../components/MainContent';

const pageDescription =
  'Integrate Rubin data into your analysis tools with APIs.';

export default function ApiAspectPage({ publicRuntimeConfig }) {
  return (
    <>
      <Head>
        <title key="title">APIs | {publicRuntimeConfig.siteName}</title>
        <meta name="description" key="description" content={pageDescription} />
        <meta
          property="og:title"
          key="ogtitle"
          content="Rubin Science Platform APIs"
        />
        <meta
          property="og:description"
          key="ogdescription"
          content={pageDescription}
        />
      </Head>

      <h1>Rubin Science Platform APIs</h1>

      <Lede>{pageDescription}</Lede>

      <h2>Table Access Protocol</h2>

      <p>
        You can access catalog data using the Table Access Protocol (TAP)
        service with popular tools such as{' '}
        <a href="http://www.star.bris.ac.uk/~mbt/topcat/">TOPCAT</a> (GUI) and{' '}
        <a href="https://pyvo.readthedocs.io/en/latest/index.html">pyvo</a>{' '}
        (Python package). The TAP endpoint is:
      </p>

      <pre>
        <code>https://data.lsst.cloud/api/tap</code>
      </pre>

      <p>
        To access the TAP service, you also need an{' '}
        <strong>access token</strong>:
        <ol>
          <li>
            Log into the Science Platform by clicking on the{' '}
            <strong>Log In</strong> button at the top-right of this page (if you
            aren’t already logged in).
          </li>
          <li>
            Click on{' '}
            <a href="/auth/tokens">
              <strong>Security tokens</strong>
            </a>{' '}
            from your user menu at the top-right of this page.
          </li>
          <li>
            On the <strong>Tokens</strong> page, click on{' '}
            <strong>Create Token</strong>.
          </li>
          <li>
            Fill out the fields:
            <ol>
              <li>
                Type a token name, such as <code>tap</code>
              </li>
              <li>
                Select the <strong>read:tap</strong> scope.
              </li>
              <li>
                Choose an expiration timeline. The default,{' '}
                <strong>Never</strong>, is good for tokens that you manage
                yourself.
              </li>
              <li>
                Click on <strong>Create</strong>.
              </li>
            </ol>
          </li>
          <li>
            Copy the token string and use it in any TAP client. If your client
            has both username and password fields, enter{' '}
            <code>x-oauth-basic</code> as the username and the token as the
            password.
          </li>
        </ol>
      </p>
    </>
  );
}

ApiAspectPage.propTypes = {
  publicRuntimeConfig: PropTypes.object,
};

ApiAspectPage.getLayout = function getLayout(page) {
  return <MainContent>{page}</MainContent>;
};

export async function getServerSideProps() {
  const { serverRuntimeConfig, publicRuntimeConfig } = getConfig();
  return {
    props: {
      serverRuntimeConfig,
      publicRuntimeConfig,
    },
  };
}
