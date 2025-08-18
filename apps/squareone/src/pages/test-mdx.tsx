import Head from 'next/head';
import type { GetServerSideProps } from 'next';
import type { ReactElement, ReactNode } from 'react';
import { MDXRemote } from 'next-mdx-remote';

import MainContent from '../components/MainContent';
import { commonMdxComponents } from '../lib/utils/mdxComponents';
import { loadAppConfig } from '../lib/config/loader';
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

    // Test with pre-serialized mock data first to isolate serialization vs rendering issue
    console.log('Creating minimal mock MDX source...');
    const appConfig = await loadAppConfig();

    // Create a minimal mock MDX source that bypasses serialization entirely
    const mockMdxSource = {
      compiledSource:
        'const { Fragment, jsx, jsxs } = _jsx_runtime;\nfunction _createMdxContent(props) {\n  const _components = {\n    h1: "h1",\n    p: "p",\n    ...props.components\n  };\n  return jsxs(Fragment, {\n    children: [jsx(_components.h1, {\n      children: "Test Heading"\n    }), "\\n", jsx(_components.p, {\n      children: "This is a test paragraph."\n    }), "\\n"]\n  });\n}\nexport default _createMdxContent;',
      scope: {},
      frontmatter: {},
    };

    console.log('Mock MDX source created successfully');
    console.log('=== END TEST MDX SERVER DEBUG ===');

    return {
      props: {
        appConfig,
        mdxSource: mockMdxSource,
      },
    };
  } catch (error) {
    console.error('Test MDX error:', error);
    throw error;
  }
};
