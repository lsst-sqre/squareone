import Document, {
  type DocumentContext,
  type DocumentInitialProps,
  Head,
  Html,
  Main,
  NextScript,
} from 'next/document';
import { loadAppConfig } from '../lib/config/loader';

/*
 * Custom document, which provides access to the head and body.
 *
 * IMPORTANT: This file intentionally uses getInitialProps, which is the correct
 * and required pattern for _document.tsx in Next.js. The getInitialProps method
 * in _document.tsx is specifically designed for SSR and is not subject to the
 * same restrictions as other pages. This is used for injecting Sentry
 * configuration into the browser.
 *
 * See https://nextjs.org/docs/advanced-features/custom-document
 */
export default class MyDocument extends Document {
  static async getInitialProps(
    ctx: DocumentContext
    // biome-ignore lint/suspicious/noExplicitAny: Sentry config structure is dynamic
  ): Promise<DocumentInitialProps & { sentryConfig?: any }> {
    const initialProps = await Document.getInitialProps(ctx);

    // Load app configuration for Sentry setup
    let sentryConfig: unknown;
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
    };
  }

  render() {
    // biome-ignore lint/suspicious/noExplicitAny: Need to access sentryConfig from props for injection
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
