import type * as Sentry from '@sentry/nextjs';

type SentryDataCollection = NonNullable<
  NonNullable<Parameters<typeof Sentry.init>[0]>['dataCollection']
>;

/**
 * Header and query-parameter name fragments that identify the requester
 * (client IP, proxy chain, remote user). These are the fragments the v10 SDK
 * scrubbed by default.
 */
const IDENTIFYING_KEY_FRAGMENTS = [
  'forwarded',
  '-ip',
  'remote-',
  'via',
  '-user',
];

/**
 * The `dataCollection` option shared by every `Sentry.init()` call (browser,
 * Node server, and edge).
 *
 * Sentry SDK v11 replaced `sendDefaultPii` with `dataCollection` and made the
 * default permissive: left unset, the SDK collects user info, cookies,
 * unscrubbed HTTP headers, and request/response bodies. Squareone runs behind
 * Gafaelfawr, so those carry session cookies, tokens, and user identity that
 * must not be shipped to Sentry.
 *
 * This pins the restrictive baseline that v10 applied when `sendDefaultPii`
 * was unset (the configuration Squareone has always run with). Do not remove
 * it or leave `dataCollection` unset in any runtime: that silently opts in to
 * the permissive defaults. Loosen individual categories here, deliberately.
 */
export const sentryDataCollection: SentryDataCollection = {
  userInfo: false,
  cookies: false,
  httpHeaders: {
    request: { deny: IDENTIFYING_KEY_FRAGMENTS },
    response: { deny: IDENTIFYING_KEY_FRAGMENTS },
  },
  httpBodies: [],
  urlQueryParams: { deny: IDENTIFYING_KEY_FRAGMENTS },
  genAI: { inputs: false, outputs: false },
  databaseQueryData: false,
  queues: false,
  graphQL: { document: false, variables: false },
};
