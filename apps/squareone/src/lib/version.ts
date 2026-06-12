import { version } from '../../package.json';

/**
 * The running app's identity: its package version and build revision.
 */
export type AppVersion = {
  /** The squareone package.json version, inlined at build time. */
  version: string;
  /**
   * The git commit SHA the image was built from, threaded in as
   * `SENTRY_RELEASE` by the Dockerfile. `null` when unset (e.g. local
   * `pnpm dev` or a build with no `SOURCE_COMMIT`).
   */
  revision: string | null;
};

/**
 * Get the running app's version and revision.
 *
 * This is the single source of truth for build identity, surfaced in the HTML
 * `<head>` (see `src/app/layout.tsx`) and bound onto every log record (see
 * `src/lib/logger.ts`). `version` is build-inlined from `package.json`;
 * `revision` is read from `process.env.SENTRY_RELEASE` at call time and
 * degrades to `null` when unset.
 */
export function getAppVersion(): AppVersion {
  return {
    version,
    revision: process.env.SENTRY_RELEASE ?? null,
  };
}
