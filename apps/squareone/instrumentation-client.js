// This file configures client-side instrumentation for Next.js.
// Client-side Sentry initialization has been moved to src/components/SentryProvider.tsx
// to use AppConfig for runtime configuration instead of build-time environment variables.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

// Re-export router transition hook for navigation instrumentation
// This will be imported from SentryProvider instead
export { onRouterTransitionStart } from './src/components/SentryProvider';
