import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, test } from 'vitest';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ADMIN_ROUTES_DIR = path.resolve(__dirname, '../app/admin');

/** The guard's import, however the specifier is quoted or the clause wrapped. */
const GUARD_IMPORT =
  /import\s*\{[^}]*\brequireAdminIngress\b[^}]*\}\s*from\s*['"]@\/lib\/admin\/requireAdminIngress['"]/;

/** A call to the guard, not merely a mention of it in a comment. */
const GUARD_CALL = /\brequireAdminIngress\s*\(/;

/** App Router route-handler filenames, including the dev-only variants. */
const ROUTE_HANDLER = /^route(\.dev)?\.(ts|tsx|js|jsx)$/;

/** Every route-handler module under a directory, recursively, as full paths. */
function findRouteHandlers(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return findRouteHandlers(entryPath);
    return ROUTE_HANDLER.test(entry.name) ? [entryPath] : [];
  });
}

/**
 * Enforce the `/admin` route handlers' authorization arrangement.
 *
 * `src/lib/admin/requireAdminIngress.ts` documents and implements the
 * assumption that these handlers do no in-app authorization because the
 * Gafaelfawr ingress does it for them. An assumption a handler has to opt into
 * by hand is one a future handler will silently opt out of — the invariant was
 * a per-route comment saying it "must be propagated" before it lived here — so
 * this suite reads the handlers on disk and fails if one of them skipped it.
 *
 * This is a source scan rather than a runtime check because the failure mode is
 * a *new* file: no test that imports the handlers it knows about can notice one
 * that nobody wired up.
 */
describe('/admin route handlers', () => {
  const handlers = findRouteHandlers(ADMIN_ROUTES_DIR);

  test('there are route handlers under /admin to check', () => {
    // A moved or renamed directory would otherwise turn every assertion below
    // into a vacuous pass over an empty list.
    expect(handlers.length).toBeGreaterThan(0);
  });

  // Named by their path under /admin so a failure reads as the file it is about.
  const cases = handlers.map(
    (file) => [path.relative(ADMIN_ROUTES_DIR, file), file] as const
  );

  test.each(cases)(
    'admin/%s delegates its auth to requireAdminIngress',
    (relative, file) => {
      const source = readFileSync(file, 'utf8');
      const why =
        'Route handlers under /admin do no authorization of their own, so one ' +
        'that skips the guard is reachable by anything that can reach the pod.';

      // A call, not a mention: naming the helper in a comment is exactly the
      // "propagate this by hand" arrangement the guard replaced.
      expect(
        GUARD_IMPORT.test(source),
        `${relative} does not import requireAdminIngress. ${why}`
      ).toBe(true);
      expect(
        GUARD_CALL.test(source),
        `${relative} does not call requireAdminIngress(request). ${why}`
      ).toBe(true);
    }
  );
});
