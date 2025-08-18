import Head from 'next/head';
import type { GetServerSideProps } from 'next';
import type { ReactElement, ReactNode } from 'react';
import styled from 'styled-components';
import { MDXRemote } from 'next-mdx-remote';

import MainContent from '../components/MainContent';
import { commonMdxComponents } from '../lib/utils/mdxComponents';
import { loadConfigAndMdx } from '../lib/config/loader';
import { useAppConfig } from '../contexts/AppConfigContext';

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

  /* Apply hover styles when inside a Link */
  a:hover &,
  a:focus & {
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

type NoteProps = {
  children?: ReactNode;
};

function Note({ children }: NoteProps) {
  return (
    <NoteContainer>
      <div className="title-bubble">
        <span>Note</span>
      </div>
      {children}
    </NoteContainer>
  );
}

const mdxComponents = {
  ...commonMdxComponents,
  Section,
  Card,
  CardGroup,
  Note,
};

const pageDescription =
  'Find documentation for Rubin Observatory data, science platform services, and software.';

type DocsPageProps = {
  mdxSource: any;
};

export default function DocsPage({ mdxSource }: DocsPageProps) {
  const appConfig = useAppConfig();

  console.log('=== DOCS COMPONENT RENDER ===');
  console.log('MDX source received:', !!mdxSource);
  console.log('MDX components available:', Object.keys(mdxComponents));
  console.log('App config available:', !!appConfig);

  // Check for specific components that might be undefined
  const problematicComponents = Object.entries(mdxComponents).filter(
    ([key, comp]) => !comp
  );
  if (problematicComponents.length > 0) {
    console.error(
      'Undefined components:',
      problematicComponents.map(([key]) => key)
    );
  }

  console.log('=== END DOCS COMPONENT DEBUG ===');

  return (
    <>
      <Head>
        <title key="title">{`Documentation | ${appConfig.siteName}`}</title>
        <meta name="description" key="description" content={pageDescription} />
        <meta property="og:title" key="ogtitle" content="Documentation" />
        <meta
          property="og:description"
          key="ogdescription"
          content={pageDescription}
        />
      </Head>

      <MDXRemote {...mdxSource} components={mdxComponents} />
    </>
  );
}

DocsPage.getLayout = function getLayout(page: ReactElement): ReactNode {
  return <MainContent>{page}</MainContent>;
};

export const getServerSideProps: GetServerSideProps<
  DocsPageProps
> = async () => {
  try {
    console.log('=== DOCS PAGE DEBUG (Production) ===');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Loading config and MDX...');

    // Load both config and MDX content using configurable mdxDir
    const { config: appConfig, mdxSource } = await loadConfigAndMdx('docs.mdx');

    console.log('Config loaded successfully:', !!appConfig);
    console.log('Config siteName:', appConfig?.siteName);
    console.log('MDX source loaded:', !!mdxSource);
    console.log('MDX source type:', typeof mdxSource);
    console.log('MDX source keys:', Object.keys(mdxSource || {}));
    console.log(
      'MDX compiledSource length:',
      mdxSource?.compiledSource?.length || 0
    );
    console.log('MDX scope keys:', Object.keys(mdxSource?.scope || {}));
    console.log('=== END DOCS DEBUG ===');

    return {
      props: {
        appConfig, // Still needed for _app.tsx to extract into context
        mdxSource,
      },
    };
  } catch (error) {
    console.error('Failed to load docs page content:', error);

    // Fallback: load config only and provide default content
    const { loadAppConfig } = await import('../lib/config/loader');
    const { serialize } = await import('next-mdx-remote/serialize');

    const appConfig = await loadAppConfig();
    const fallbackMdx = await serialize(
      '# Documentation\n\nContent temporarily unavailable.'
    );

    return {
      props: {
        appConfig, // Still needed for _app.tsx to extract into context
        mdxSource: fallbackMdx,
      },
    };
  }
};
