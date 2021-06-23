import Head from 'next/head';
import getConfig from 'next/config';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Link from 'next/link';

import { Lede } from '../components/typography';

const Section = styled.section`
  margin-top: 2rem;
`;

export const Card = styled.article`
  width: 100%;
  border-radius: 0.5rem;
  --tw-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  --tw-ring-offset-shadow: 0 0 transparent;
  --tw-ring-shadow: 0 0 transparent;
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000),
    var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
  padding: 1rem;
  margin-left: -1rem;

  border: solid 1px transparent;

  color: var(--rsd-component-text-color);
  background-color: var(--sqo-doc-card-background-color);

  :hover {
    border: solid 1px var(--rsd-color-primary-600);
  }

  h3 {
    margin-top: 0;
  }
  p:last-child {
    margin-bottom: 0;
  }
`;

export const CardGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
  grid-gap: 1rem;
  gap: 1rem;
`;

const NoteContainer = styled.div`
  margin: 1rem 0 0;
  padding: 0.5rem;
  border-radius: 1rem;
  --tw-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  --tw-ring-offset-shadow: 0 0 transparent;
  --tw-ring-shadow: 0 0 transparent;
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000),
    var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
  border: solid 0.5px var(--rsd-color-red-500);
  background-color: var(--sqr-note-background-color);

  .title-bubble {
    background-color: var(--rsd-color-red-500);
    margin: -0.5rem 0.5rem 0.5rem -0.5rem;
    padding: 0.5rem 0.5rem;
    float: left;
    width: auto;
    border-radius: 0.5rem 0 0.5rem 0;
  }
  .title-bubble span {
    text-transform: uppercase;
    font-weight: 700;
    color: white;
    font-size: 0.9rem;
  }

  p {
    margin-top: 0;
  }
`;

function Note({ children }) {
  return (
    <NoteContainer>
      <div className="title-bubble">
        <span>Note</span>
      </div>
      {children}
    </NoteContainer>
  );
}

Note.propTypes = {
  children: PropTypes.node,
};

const pageDescription =
  'Find documentation for Rubin Observatory data, science platform services, and software.';

export default function DocsPage({ publicRuntimeConfig }) {
  return (
    <>
      <Head>
        <title key="title">
          Documentation | {publicRuntimeConfig.siteName}
        </title>
        <meta name="description" key="description" content={pageDescription} />
        <meta property="og:title" key="ogtitle" content="Documentation" />
        <meta
          property="og:description"
          key="ogdescription"
          content={pageDescription}
        />
      </Head>

      <h1>Rubin Science Platform documentation</h1>

      <Lede>{pageDescription}</Lede>

      <Section>
        <h2>Data documentation</h2>

        <CardGroup>
          <a href="https://dp0-1.lsst.io/">
            <Card>
              <h3>Data Preview 0.1 (DP0.1)</h3>
              <p>Description</p>
            </Card>
          </a>
        </CardGroup>
      </Section>

      <Section>
        <h2>Science platform documentation</h2>

        <CardGroup>
          <a href="/portal/app/onlinehelp/">
            <Card>
              <h3>Portal</h3>
              <p>Description</p>
            </Card>
          </a>

          <a href="https://nb.lsst.io">
            <Card>
              <h3>Notebooks</h3>
              <p>Description</p>
            </Card>
          </a>

          <Link href="/api-aspect">
            <Card>
              <h3>APIs</h3>
              <p>Description</p>
            </Card>
          </Link>
        </CardGroup>
      </Section>

      <Section>
        <h2>Software documentation</h2>

        <CardGroup>
          <a href="https://pipelines.lsst.io">
            <Card>
              <h3>LSST Science Pipelines</h3>
              <p>Description</p>
              <Note>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin
                  facilisis pharetra neque, at semper nulla mattis auctor. Proin
                  semper mollis enim eget interdum. Mauris eleifend eget diam
                  vitae bibendum. Praesent ut aliquet odio, sodales imperdiet
                  nisi. Nam interdum imperdiet tortor sed fringilla. Maecenas
                  efficitur mi sodales nulla commodo rutrum. Ut ornare diam
                  quam, sed commodo turpis aliquam et. In nec enim consequat,
                  suscipit tortor sit amet, luctus ante. Integer dictum augue
                  diam, non pulvinar massa euismod in. Morbi viverra condimentum
                  auctor. Nullam et metus mauris. Cras risus ex, porta sit amet
                  nibh et, dapibus auctor leo.
                </p>
              </Note>
            </Card>
          </a>
        </CardGroup>
      </Section>

      <Section>
        <h2>Still need help?</h2>
        <p>
          <Link href="/support">
            Learn how to get support or report issues.
          </Link>
        </p>
      </Section>
    </>
  );
}

DocsPage.propTypes = {
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
