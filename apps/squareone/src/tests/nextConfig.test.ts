import { createRequire } from 'node:module';

import {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_BUILD,
} from 'next/constants';
import { describe, expect, it } from 'vitest';

// Narrow view of the resolved Next.js config — only the field under test.
type ResolvedConfig = { pageExtensions: string[] };
type NextConfigFn = (
  phase: string,
  context: { defaultConfig: Record<string, unknown> }
) => ResolvedConfig | Promise<ResolvedConfig>;

// `next.config.js` is CommonJS and lives at the app root (outside `src/`).
// Use a real `require` so it loads untouched by Vite's transform pipeline,
// exercising the actual Sentry-wrapped export the build consumes.
const require = createRequire(import.meta.url);
const nextConfig = require('../../next.config.js') as NextConfigFn;

const resolveConfig = (phase: string) =>
  Promise.resolve(nextConfig(phase, { defaultConfig: {} }));

describe('next.config phase-aware pageExtensions', () => {
  it('excludes the dev.* route extensions from production builds', async () => {
    // This locks the production-exclusion guarantee: without `dev.*` in
    // `pageExtensions`, the dev-only `page.dev.tsx` / `route.dev.ts` files are
    // not recognized as routes and never enter the build or Docker image.
    const config = await resolveConfig(PHASE_PRODUCTION_BUILD);

    expect(config.pageExtensions).toEqual(['tsx', 'ts', 'jsx', 'js']);
    expect(config.pageExtensions).not.toContain('dev.tsx');
    expect(config.pageExtensions).not.toContain('dev.ts');
  });

  it('includes the dev.* route extensions in the development server', async () => {
    // Confirms the Sentry wrapper forwards `phase` and dev tooling is built in
    // when running `next dev`.
    const config = await resolveConfig(PHASE_DEVELOPMENT_SERVER);

    expect(config.pageExtensions).toContain('dev.tsx');
    expect(config.pageExtensions).toContain('dev.ts');
  });
});
