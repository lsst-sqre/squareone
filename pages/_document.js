import Document from 'next/document';
import { ServerStyleSheet } from 'styled-components';

/*
 * Custom document, which provides access to the head and body, and is also
 * needed for integrating styled-components.
 *
 * See https://github.com/vercel/next.js/blob/canary/examples/with-styled-components/pages/_document.js
 */
export default class MyDocument extends Document {
  static async getInitialProps(ctx) {
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
}
