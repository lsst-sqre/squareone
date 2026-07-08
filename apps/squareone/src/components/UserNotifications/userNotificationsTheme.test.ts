import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Guardrail for the dark-mode token migration (DM-55433, task #538).
 *
 * The two user-facing notification CSS modules must drive text, borders, and
 * subtle surfaces off the adaptive `--rsd-component-*` semantic tokens rather
 * than fixed `--rsd-color-*`-scale grays, so `/notifications` adapts to dark
 * mode. Only the gray-scale text/border/surface tokens are in scope here; the
 * red/blue callout colors are migrated to squared components in a sibling task.
 */

const MODULE_DIR = __dirname;
const USER_MODULES = [
  'UserNotificationsTableView.module.css',
  'UserNotificationDetailView.module.css',
];

function readModule(name: string): string {
  return readFileSync(join(MODULE_DIR, name), 'utf8');
}

describe('user notification CSS modules — dark-mode token migration', () => {
  for (const name of USER_MODULES) {
    it(`${name} uses no fixed gray-scale color tokens`, () => {
      const css = readModule(name);
      const grayTokens = css.match(/--rsd-color-gray-\d+/g) ?? [];
      expect(grayTokens).toEqual([]);
    });

    it(`${name} has no hardcoded hex colors`, () => {
      const css = readModule(name);
      const hexColors = css.match(/:\s*#[0-9a-fA-F]{3,8}\b/g) ?? [];
      expect(hexColors).toEqual([]);
    });
  }

  it('adopts the adaptive semantic tokens for secondary text, dividers, and subtle surfaces', () => {
    const table = readModule('UserNotificationsTableView.module.css');
    const detail = readModule('UserNotificationDetailView.module.css');

    // Muted/secondary text → --rsd-component-text-secondary-color
    expect(table).toContain('--rsd-component-text-secondary-color');
    expect(detail).toContain('--rsd-component-text-secondary-color');

    // Borders/dividers → --rsd-component-divider-color
    expect(table).toContain('--rsd-component-divider-color');
    expect(detail).toContain('--rsd-component-divider-color');

    // Subtle surfaces (hover/selected rows) → surface-secondary-background
    expect(table).toContain(
      '--rsd-component-surface-secondary-background-color'
    );

    // Primary text → --rsd-component-text-color
    expect(table).toContain('--rsd-component-text-color');
  });
});
