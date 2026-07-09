import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Guardrail for the dark-mode token migration (DM-55433, task #539).
 *
 * The four admin notification CSS modules must drive text, borders, and subtle
 * surfaces off the adaptive `--rsd-component-*` semantic tokens rather than
 * fixed `--rsd-color-*`-scale grays (or hardcoded hex), so `/admin/notifications`
 * adapts to dark mode. Only the gray-scale text/border/surface tokens are in
 * scope here; the red callout colors and the primary-600 accent stay on their
 * fixed scale and migrate to squared components in a sibling task (#540).
 */

const COMPONENTS_DIR = join(__dirname, '..');
const ADMIN_MODULES = [
  'AdminNotifications/NotificationFilters.module.css',
  'AdminNotifications/NotificationsTableView.module.css',
  'NotificationDetailView/NotificationDetailView.module.css',
  'NotificationForm/NotificationForm.module.css',
];

function readModule(relPath: string): string {
  return readFileSync(join(COMPONENTS_DIR, relPath), 'utf8');
}

describe('admin notification CSS modules — dark-mode token migration', () => {
  for (const relPath of ADMIN_MODULES) {
    it(`${relPath} uses no fixed gray-scale color tokens`, () => {
      const css = readModule(relPath);
      const grayTokens = css.match(/--rsd-color-gray-\d+/g) ?? [];
      expect(grayTokens).toEqual([]);
    });

    it(`${relPath} has no hardcoded hex colors`, () => {
      const css = readModule(relPath);
      const hexColors = css.match(/:\s*#[0-9a-fA-F]{3,8}\b/g) ?? [];
      expect(hexColors).toEqual([]);
    });
  }

  it('adopts the adaptive semantic tokens for secondary text, dividers, and subtle surfaces', () => {
    const filters = readModule(
      'AdminNotifications/NotificationFilters.module.css'
    );
    const table = readModule(
      'AdminNotifications/NotificationsTableView.module.css'
    );
    const detail = readModule(
      'NotificationDetailView/NotificationDetailView.module.css'
    );
    const form = readModule('NotificationForm/NotificationForm.module.css');

    // Muted/secondary text → --rsd-component-text-secondary-color
    expect(filters).toContain('--rsd-component-text-secondary-color');
    expect(table).toContain('--rsd-component-text-secondary-color');
    expect(detail).toContain('--rsd-component-text-secondary-color');
    expect(form).toContain('--rsd-component-text-secondary-color');

    // Borders/dividers → --rsd-component-divider-color
    expect(form).toContain('--rsd-component-divider-color');

    // Subtle surfaces (inline code chip, preview block) →
    // surface-secondary-background
    expect(detail).toContain(
      '--rsd-component-surface-secondary-background-color'
    );
    expect(form).toContain(
      '--rsd-component-surface-secondary-background-color'
    );

    // Primary text (inline code chip) → --rsd-component-text-color
    expect(detail).toContain('--rsd-component-text-color');
  });
});
