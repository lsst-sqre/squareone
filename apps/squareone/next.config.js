// next.config.js
// https://nextjs.org/docs/api-reference/next.config.js/introduction

const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');

module.exports = (phase) => {
  // Dev-only tooling (the `/dev` control panel and every `/api/dev/*` mock) is
  // built into the app exclusively when running the development server. The
  // matching route files use a `.dev.tsx` / `.dev.ts` suffix; production builds
  // omit those extensions from `pageExtensions`, so Next.js does not recognize
  // them as routes and they never enter `.next/` or the Docker image. The dev
  // rewrites that point real RSP API paths at the mock handlers are likewise
  // gated off in production builds.
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;

  const config = {
    pageExtensions: isDev
      ? ['dev.tsx', 'dev.ts', 'tsx', 'ts', 'jsx', 'js']
      : ['tsx', 'ts', 'jsx', 'js'],
    transpilePackages: [
      '@lsst-sqre/squared',
      '@lsst-sqre/repertoire-client',
      '@lsst-sqre/gafaelfawr-client',
      '@lsst-sqre/semaphore-client',
      '@lsst-sqre/times-square-client',
    ],
    async rewrites() {
      // No dev rewrites in production builds: the mock handlers do not exist in
      // the production bundle, so there is nothing to route to.
      if (!isDev) return [];
      return [
        // Mock Gafaelfawr (this is never triggered by a production ingress)
        {
          source: '/auth/api/v1/user-info',
          destination: '/api/dev/user-info',
        },
        // Mock Gafaelfawr login info / CSRF + available scopes
        {
          source: '/auth/api/v1/login',
          destination: '/api/dev/login-info',
        },
        // Mock Repertoire (this is never triggered by a production ingress)
        {
          source: '/repertoire/discovery',
          destination: '/api/dev/repertoire/discovery',
        },
        // Mock Semaphore (this is never triggered by a production ingress)
        {
          source: '/semaphore/v1/broadcasts',
          destination: '/api/dev/semaphore/v1/broadcasts',
        },
        {
          source: '/semaphore/v1/notifications/messages',
          destination: '/api/dev/semaphore/v1/notifications/messages',
        },
        {
          source: '/semaphore/v1/notifications/read',
          destination: '/api/dev/semaphore/v1/notifications/read',
        },
        {
          source: '/semaphore/v1/notifications/unread',
          destination: '/api/dev/semaphore/v1/notifications/unread',
        },
        {
          source: '/semaphore/v1/notifications/messages/:id',
          destination: '/api/dev/semaphore/v1/notifications/messages/:id',
        },
        {
          source: '/semaphore/v1/admin/notifications',
          destination: '/api/dev/semaphore/v1/admin/notifications',
        },
        {
          source: '/semaphore/v1/admin/notifications/:id',
          destination: '/api/dev/semaphore/v1/admin/notifications/:id',
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

  // Stamp client + server bundles and uploaded source maps with the git commit
  // SHA, threaded in as SENTRY_RELEASE at build time by the Dockerfile. Builds
  // run through turbo in strict env mode, so SENTRY_RELEASE must be declared in
  // turbo.json's build `env` for it to reach this process (which also keys the
  // build cache on the SHA, as the value is baked into the client bundle).
  // Unset in local dev/builds, where the plugin degrades gracefully to no
  // release. At runtime the client release is (re-)set from
  // window.__SENTRY_CONFIG__ (see instrumentation-client.js), which carries the
  // same SHA.
  release: {
    name: process.env.SENTRY_RELEASE,
  },

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: '/monitoring',

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Webpack-specific build options. Next.js 16 builds with Turbopack by
  // default, where these options are no-ops; they apply only to builds run
  // with `next build --webpack`.
  webpack: {
    // Automatically annotate React components to show their full name in breadcrumbs and session replay
    reactComponentAnnotation: {
      enabled: true,
    },

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    treeshake: {
      removeDebugLogging: true,
    },

    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: false,
  },
});

module.exports = sentryWrappedConfig;
