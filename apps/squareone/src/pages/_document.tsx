import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
  DocumentInitialProps,
} from 'next/document';
import { ServerStyleSheet } from 'styled-components';

/*
 * Custom document, which provides access to the head and body, and is also
 * needed for integrating styled-components.
 *
 * IMPORTANT: This file intentionally uses getInitialProps, which is the correct
 * and required pattern for _document.tsx in Next.js. The getInitialProps method
 * in _document.tsx is specifically designed for SSR and is not subject to the
 * same restrictions as other pages. This is required for styled-components
 * server-side rendering and style extraction.
 *
 * See https://github.com/vercel/next.js/blob/canary/examples/with-styled-components/pages/_document.js
 * See https://nextjs.org/docs/advanced-features/custom-document
 */
export default class MyDocument extends Document {
  static async getInitialProps(
    ctx: DocumentContext
  ): Promise<DocumentInitialProps> {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;

    try {
      /* eslint-disable react/jsx-props-no-spreading */
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) =>
            sheet.collectStyles(<App {...props} />),
        });
      /* eslint-enable react/jsx-props-no-spreading */

      const initialProps = await Document.getInitialProps(ctx);
      return {
        ...initialProps,
        styles: (
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>
        ),
      };
    } finally {
      sheet.seal();
    }
  }

  render() {
    return (
      <Html lang="en" dir="ltr">
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
