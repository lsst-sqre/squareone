import Head from 'next/head';
import getConfig from 'next/config';
import PropTypes from 'prop-types';
import Link from 'next/link';
import styled from 'styled-components';

import { Lede, CtaLink } from '../components/typography';

const Section = styled.section`
  margin-bottom: 2rem;
`;

const pageDescription =
  'Get help with the Rubin Science Platform, data, and software.';

export default function SupportPage({ publicRuntimeConfig }) {
  return (
    <>
      <Head>
        <title key="title">Get help | {publicRuntimeConfig.siteName}</title>
        <meta name="description" key="description" content={pageDescription} />
        <meta property="og:title" key="ogtitle" content="Get help" />
        <meta
          property="og:description"
          key="ogdescription"
          content={pageDescription}
        />
      </Head>

      <h1>Get help with the Rubin Science Platform</h1>

      <Lede>
        Besides the <Link href="/docs">documentation</Link>, you can get help
        from Rubin Observatory staff. Here are the ways to ask for help.
      </Lede>

      <Section>
        <h2>Data Preview 0 science questions</h2>

        <p>
          For questions about the Data Preview dataset (DESC DC2) and analyzing
          that data (such as with the LSST Science Pipelines), create a new
          topic in the{' '}
          <a href="https://community.lsst.org/c/support/dp0/49">
            Data Preview 0 Support category
          </a>{' '}
          of the Community forum.
        </p>

        <CtaLink
          href="http://community.lsst.org/new-topic?category=support/dp0
        "
        >
          Create a science support topic in the forum
        </CtaLink>
      </Section>

      <Section>
        <h2>Rubin Science Platform technical support and feature requests</h2>
        <p>
          For technical issues or feature requests related to the Rubin Science
          Platform itself (the Portal, Notebooks, and API services such as TAP)
          create a GitHub issue in the{' '}
          <a href="https://github.com/rubin-dp0/Support">rubin-dp0/Support</a>{' '}
          repository.
        </p>
        <CtaLink href="https://github.com/rubin-dp0/Support/issues/new/choose">
          Create a GitHub issue
        </CtaLink>
      </Section>
    </>
  );
}

SupportPage.propTypes = {
  publicRuntimeConfig: PropTypes.object,
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
