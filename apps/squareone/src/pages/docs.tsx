import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import { MDXRemote } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import type { ReactElement, ReactNode } from 'react';
import styled from 'styled-components';

import MainContent from '../components/MainContent';
import { useAppConfig } from '../contexts/AppConfigContext';
import { loadConfigAndMdx } from '../lib/config/loader';
import { commonMdxComponents } from '../lib/utils/mdxComponents';

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
  // biome-ignore lint/suspicious/noExplicitAny: MDX serialized source is an opaque type from next-mdx-remote
  mdxSource: any;
};

export default function DocsPage({ mdxSource }: DocsPageProps) {
  const appConfig = useAppConfig();

  // Check for specific components that might be undefined
  const problematicComponents = Object.entries(mdxComponents).filter(
    ([_key, comp]) => !comp
  );
  if (problematicComponents.length > 0) {
    console.error(
      'Undefined components:',
      problematicComponents.map(([key]) => key)
    );
  }

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
    // Load config and raw MDX content
    const { config: appConfig, mdxContent } =
      await loadConfigAndMdx('docs.mdx');

    // Serialize MDX content directly in getServerSideProps using ES import
    const mdxSource = await serialize(mdxContent);

    // Load footer MDX
    const { loadFooterMdx } = await import('../lib/config/footerLoader');
    const footerMdxSource = await loadFooterMdx(appConfig);

    return {
      props: {
        appConfig, // Provided to _app.tsx which extracts into context
        mdxSource,
        footerMdxSource,
      },
    };
  } catch (_error) {
    // Fallback: load config only and provide default content
    const { loadAppConfig } = await import('../lib/config/loader');
    const { loadFooterMdx } = await import('../lib/config/footerLoader');

    const appConfig = await loadAppConfig();
    const fallbackMdx = await serialize(
      '# Documentation\n\nContent temporarily unavailable.'
    );
    const footerMdxSource = await loadFooterMdx(appConfig);

    return {
      props: {
        appConfig, // Provided to _app.tsx which extracts into context
        mdxSource: fallbackMdx,
        footerMdxSource,
      },
    };
  }
};
