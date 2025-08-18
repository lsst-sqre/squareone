import Head from 'next/head';
import type { GetServerSideProps } from 'next';
import type { ReactElement, ReactNode } from 'react';
import { MDXRemote } from 'next-mdx-remote';

import MainContent from '../components/MainContent';
import { commonMdxComponents } from '../lib/utils/mdxComponents';
import { useAppConfig } from '../contexts/AppConfigContext';

type TestMdxPageProps = {
  mdxSource: any;
};

export default function TestMdxPage({ mdxSource }: TestMdxPageProps) {
  const appConfig = useAppConfig();

  console.log('=== TEST MDX COMPONENT RENDER ===');
  console.log('MDX source received:', !!mdxSource);
  console.log('Common MDX components:', Object.keys(commonMdxComponents));
  console.log('=== END TEST MDX DEBUG ===');

  return (
    <>
      <Head>
        <title key="title">{`Test MDX | ${appConfig.siteName}`}</title>
      </Head>

      <h1>Test MDX Page</h1>
      <MDXRemote {...mdxSource} components={commonMdxComponents} />
    </>
  );
}

TestMdxPage.getLayout = function getLayout(page: ReactElement): ReactNode {
  return <MainContent>{page}</MainContent>;
};

export const getServerSideProps: GetServerSideProps<
  TestMdxPageProps
> = async () => {
  try {
    console.log('=== TEST MDX SERVER SIDE ===');

    // Test serialize function with simple static content
    console.log('Testing serialize with static MDX content...');
    // const appConfig = await loadAppConfig();

    // Simple static MDX content for testing
    const testMdxContent = `# Hello World

This is a **test** of the MDX serialization function.

- First item
- Second item

\`\`\`javascript
console.log('Hello from code block');
\`\`\`
`;

    console.log('Static MDX content created');
    console.log('Content length:', testMdxContent.length);

    // Try to serialize the static content
    console.log('Attempting to serialize...');
    const { serialize } = await import('next-mdx-remote/serialize');
    console.log('Serialize function imported:', typeof serialize);

    const mdxSource = await serialize(testMdxContent);
    console.log('Serialization successful!');
    console.log('MDX source type:', typeof mdxSource);
    console.log('MDX source keys:', Object.keys(mdxSource || {}));
    console.log('=== END TEST MDX SERVER DEBUG ===');

    return {
      props: {
        mdxSource,
      },
    };
  } catch (error) {
    console.error('Test MDX error:', error);
    console.error(
      'Error details:',
      error instanceof Error ? error.message : String(error)
    );
    console.error(
      'Error stack:',
      error instanceof Error ? error.stack : 'No stack trace'
    );

    // Fallback to avoid page crash
    // const appConfig = await loadAppConfig();
    const fallbackMdxSource = {
      compiledSource:
        'const { jsx } = _jsx_runtime;\nfunction _createMdxContent() { return jsx("div", { children: "Serialization failed" }); }\nexport default _createMdxContent;',
      scope: {},
      frontmatter: {},
    };

    return {
      props: {
        mdxSource: fallbackMdxSource,
      },
    };
  }
};
