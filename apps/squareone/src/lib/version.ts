import { version } from '../../package.json';

/**
 * The running app's identity: its package version and build revision.
 */
export type AppVersion = {
  /**
   * The container image's primary tag, threaded in as `SQUAREONE_VERSION` by
   * the Dockerfile — the branch-derived tag for PR/branch builds (e.g.
   * `tickets-DM-55226`), the release version for releases. Falls back to the
   * build-inlined `package.json` version when unset (e.g. local `pnpm dev` or
   * `pnpm build`).
   */
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
 * `src/lib/logger.ts`). `version` is read from `process.env.SQUAREONE_VERSION`
 * (the image tag) at call time, falling back to the build-inlined `package.json`
 * version when unset; `revision` is read from `process.env.SENTRY_RELEASE` and
 * degrades to `null` when unset.
 */
export function getAppVersion(): AppVersion {
  return {
    version: process.env.SQUAREONE_VERSION || version,
    revision: process.env.SENTRY_RELEASE ?? null,
  };
}
