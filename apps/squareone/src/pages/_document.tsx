import Document, {
  type DocumentContext,
  type DocumentInitialProps,
  Head,
  Html,
  Main,
  NextScript,
} from 'next/document';
import { ServerStyleSheet } from 'styled-components';
import { loadAppConfig } from '../lib/config/loader';

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
  ): Promise<DocumentInitialProps & { sentryConfig?: any }> {
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

      // Load app configuration for Sentry setup
      let sentryConfig;
      try {
        const config = await loadAppConfig();
        // Extract Sentry configuration from server-side AppConfig and prepare it
        // for injection into the browser. This allows client-side Sentry to use
        // runtime configuration (like DSN from Kubernetes ConfigMaps) rather than
        // build-time environment variables.
        sentryConfig = {
          dsn: config.sentryDsn,
          environment: config.environmentName,
          tracesSampleRate: config.sentryTracesSampleRate,
          replaysSessionSampleRate: config.sentryReplaysSessionSampleRate,
          replaysOnErrorSampleRate: config.sentryReplaysOnErrorSampleRate,
          baseUrl: config.baseUrl,
        };
      } catch (error) {
        console.error('Failed to load Sentry config:', error);
        sentryConfig = null;
      }

      return {
        ...initialProps,
        sentryConfig,
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
    const { sentryConfig } = this.props as any;

    return (
      <Html lang="en" dir="ltr">
        <Head>
          {sentryConfig && (
            <script
              dangerouslySetInnerHTML={{
                __html: `window.__SENTRY_CONFIG__ = ${JSON.stringify(
                  sentryConfig
                )};`,
              }}
            />
          )}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
