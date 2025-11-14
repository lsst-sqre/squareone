// next.config.js
// https://nextjs.org/docs/api-reference/next.config.js/introduction

module.exports = (_phase, { defaultConfig }) => {
  const config = {
    ...defaultConfig,
    transpilePackages: ['@lsst-sqre/squared'],
    compiler: {
      styledComponents: true,
    },
    async rewrites() {
      return [
        // Mock Gafaelfawr (this is never triggered by a production ingress)
        {
          source: '/auth/api/v1/user-info',
          destination: '/api/dev/user-info',
        },
        // Mock Times Square (this is never triggered by a production ingress)
        {
          source: '/times-square/api/v1/pages',
          destination: '/api/dev/times-square/v1/pages',
        },
        {
          source: '/times-square/api/v1/pages/:page/html',
          destination: '/api/dev/times-square/v1/pages/:page/html',
        },
        {
          source: '/times-square/api/v1/pages/:page/htmlstatus',
          destination: '/api/dev/times-square/v1/pages/:page/htmlstatus',
        },
        {
          source: '/times-square/api/v1/pages/:page/htmlevents',
          destination: '/api/dev/times-square/v1/pages/:page/htmlevents',
        },
        {
          source: '/times-square/api/v1/pages/:page',
          destination: '/api/dev/times-square/v1/pages/:page',
        },
        {
          source: '/times-square/api/v1/github',
          destination: '/api/dev/times-square/v1/github',
        },
        {
          source: '/times-square/api/v1/github/:tsSlug*',
          destination: '/api/dev/times-square/v1/github/:tsSlug*',
        },
      ];
    },
  };
  return config;
};

// Injected content via Sentry wizard below

const { withSentryConfig } = require('@sentry/nextjs');

const sentryWrappedConfig = withSentryConfig(module.exports, {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: 'rubin-observatory',
  project: 'squareone',

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Automatically annotate React components to show their full name in breadcrumbs and session replay
  reactComponentAnnotation: {
    enabled: true,
  },

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: '/monitoring',

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: false,
});

// Export the Sentry-wrapped config directly for Next.js 13.5.11
// The property filtering that was needed for Next.js 12.3.5 is no longer required
module.exports = sentryWrappedConfig;
