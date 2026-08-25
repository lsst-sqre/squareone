import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, test } from 'vitest';

import { ADMIN_PAGE_IDS } from '../lib/config/adminPageScopes';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ADMIN_APP_DIR = path.resolve(__dirname, '../app/admin');

/** App Router page modules. */
const PAGE_MODULE = /^page\.(ts|tsx|js|jsx)$/;

/**
 * The `/admin` index, which is deliberately ungated: it is the landing route
 * that decides *where* a person can go, and it renders its own "no admin pages
 * are available" state for someone who can go nowhere.
 */
const INDEX_PAGE = path.join(ADMIN_APP_DIR, 'page.tsx');

/** The gate, with the page id it was given. */
const GATE = /<AdminRequired\s+pageId="([A-Za-z]+)"/;

/** Every page module under a directory, recursively, as full paths. */
function findPages(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return findPages(entryPath);
    return PAGE_MODULE.test(entry.name) ? [entryPath] : [];
  });
}

/**
 * Enforce that every admin page gates on its own configured page scopes.
 *
 * The layout's section-wide gate only asks whether a person can reach *some*
 * admin page, so a page that adds no gate of its own is reachable by anyone
 * holding any admin scope — they would see a page whose every request answers
 * 403 instead of the Unauthorized note. That is a per-page opt-in, and a
 * per-page opt-in is one a future page will silently skip, so this suite reads
 * the pages on disk rather than trusting the ones a test happens to import.
 *
 * A source scan rather than a runtime check because the failure mode is a *new*
 * file: no test that imports the pages it knows about can notice one nobody
 * wired up.
 */
describe('/admin pages', () => {
  const pages = findPages(ADMIN_APP_DIR).filter((file) => file !== INDEX_PAGE);

  test('there are admin pages to check', () => {
    // A moved or renamed directory would otherwise turn every assertion below
    // into a vacuous pass over an empty list.
    expect(pages.length).toBeGreaterThan(0);
  });

  // Named by their path under /admin so a failure reads as the file it is about.
  const cases = pages.map(
    (file) => [path.relative(ADMIN_APP_DIR, file), file] as const
  );

  test.each(cases)(
    'admin/%s gates on a configured page id',
    (relative, file) => {
      const source = readFileSync(file, 'utf8');
      const match = GATE.exec(source);

      expect(
        match,
        `${relative} does not render <AdminRequired pageId="…">. Without it the ` +
          'page is reachable by anyone holding any admin scope, whose requests ' +
          'would then 403 one by one instead of the page refusing them up front.'
      ).not.toBeNull();

      expect(
        ADMIN_PAGE_IDS as readonly string[],
        `${relative} gates on an unknown page id. Page ids are fixed in ` +
          'ADMIN_PAGE_IDS and validated in the config schema.'
      ).toContain(match?.[1]);
    }
  );
});
