import { describe, expect, it } from 'vitest';

import { findThemeTokenViolations } from './validate-theme-tokens.js';

describe('findThemeTokenViolations', () => {
  it('returns no violations for a clean, migrated module', () => {
    // The migrated modules only use adaptive semantic tokens for text color.
    const css = `
.title {
  color: var(--rsd-component-text-color);
}

.timestamp {
  color: var(--rsd-component-text-secondary-color);
}

.row {
  border-bottom: 1px solid var(--rsd-component-divider-color);
  background-color: var(--rsd-component-surface-secondary-background-color);
}
`;
    expect(findThemeTokenViolations(css)).toEqual([]);
  });

  it('flags a fixed gray-scale token used for text color', () => {
    const css = `
.title {
  color: var(--rsd-color-gray-800);
}
`;
    const violations = findThemeTokenViolations(css);
    expect(violations).toHaveLength(1);
    expect(violations[0]).toMatchObject({
      line: 3,
      value: 'var(--rsd-color-gray-800)',
    });
  });

  it('flags a fixed red-scale token used for text color', () => {
    const css = `.error { color: var(--rsd-color-red-600); }`;
    const violations = findThemeTokenViolations(css);
    expect(violations).toHaveLength(1);
    expect(violations[0].value).toBe('var(--rsd-color-red-600)');
  });

  it('flags a hardcoded hex used for text color', () => {
    const css = `.muted { color: #4b5563; }`;
    const violations = findThemeTokenViolations(css);
    expect(violations).toHaveLength(1);
    expect(violations[0].value).toBe('#4b5563');
  });

  it('flags the other fixed hue scales (blue/green/yellow/orange/purple)', () => {
    const css = `
.a { color: var(--rsd-color-blue-500); }
.b { color: var(--rsd-color-green-500); }
.c { color: var(--rsd-color-yellow-500); }
.d { color: var(--rsd-color-orange-500); }
.e { color: var(--rsd-color-purple-500); }
`;
    expect(findThemeTokenViolations(css)).toHaveLength(5);
  });

  it('does not flag a fixed hue scale on a non-color property', () => {
    // The decorative unread dot uses background-color, which is not a text color.
    const css = `
.unreadDot {
  background-color: var(--rsd-color-blue-600);
}
`;
    expect(findThemeTokenViolations(css)).toEqual([]);
  });

  it('does not flag a hex on a non-color property', () => {
    const css = `.box { background-color: #f3f4f6; border: 1px solid #d1d5db; }`;
    expect(findThemeTokenViolations(css)).toEqual([]);
  });

  it('does not flag the primary brand-accent scale used for text color', () => {
    // --rsd-color-primary-* is the Rubin brand accent (a semantic alias), not a
    // fixed neutral/status hue scale; pre-existing link/hover affordances keep it.
    const css = `
.summaryToggle:hover .summaryText {
  color: var(--rsd-color-primary-600);
}

.bannerButton {
  color: var(--rsd-color-primary-600);
}
`;
    expect(findThemeTokenViolations(css)).toEqual([]);
  });

  it('does not flag an adaptive semantic component token used for text color', () => {
    const css = `.title { color: var(--rsd-component-text-color); }`;
    expect(findThemeTokenViolations(css)).toEqual([]);
  });

  it('reports the 1-based line number of each violation', () => {
    const css = `.a {\n  color: var(--rsd-color-gray-900);\n}\n.b {\n  color: #111827;\n}\n`;
    const violations = findThemeTokenViolations(css);
    expect(violations.map((v) => v.line)).toEqual([2, 5]);
  });
});
