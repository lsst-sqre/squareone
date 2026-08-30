import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Static assertions over the SidebarLayout CSS module sources.
 *
 * These files style themselves with `--rsd-color-primary-*` custom properties
 * — the Rubin brand teal ramp — but their inline fallbacks (used only if the
 * token fails to resolve) were copied from a blue palette: #0066cc, #e6f3ff,
 * #f0f9ff, #bfdbfe. A wrong-hue fallback silently paints the wrong color
 * whenever the token is absent. The fallbacks must match the teal ramp value
 * of the token they back.
 */

const sidebarCss = [
  'SidebarLayout.module.css',
  'SidebarNavItem.module.css',
  'MobileMenuToggle.module.css',
  'Sidebar.module.css',
].map((relative) => ({
  relative,
  source: readFileSync(path.join(__dirname, relative), 'utf8'),
}));

// Blue fallback hexes that do not belong to the teal `primary` ramp.
const wrongHueFallbacks = ['#0066cc', '#e6f3ff', '#f0f9ff', '#bfdbfe'];

describe('SidebarLayout CSS fallback hexes match the teal brand ramp', () => {
  for (const { relative, source } of sidebarCss) {
    const normalized = source.toLowerCase();
    for (const hex of wrongHueFallbacks) {
      it(`${relative} does not use the blue fallback ${hex}`, () => {
        expect(normalized).not.toContain(hex);
      });
    }
  }
});
