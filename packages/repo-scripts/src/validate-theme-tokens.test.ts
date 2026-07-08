import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  darkThemeColorSelectors,
  findThemeTokenViolations,
  isDarkHex,
  loadBaseline,
  partitionByBaseline,
  SCAN_ROOTS,
  scannedModules,
  validateModuleFile,
} from './validate-theme-tokens.js';

describe('findThemeTokenViolations — principled dark-text rule', () => {
  it('returns no violations for a clean, migrated module', () => {
    // Migrated modules only use adaptive semantic tokens for text color.
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

  it('flags a fixed DARK gray-scale token used for text color', () => {
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

  it('flags the muted secondary-text gray weights (gray-400 through gray-600)', () => {
    const css = `
.a { color: var(--rsd-color-gray-400); }
.b { color: var(--rsd-color-gray-500); }
.c { color: var(--rsd-color-gray-600); }
.d { color: var(--rsd-color-gray-900); }
`;
    expect(findThemeTokenViolations(css)).toHaveLength(4);
  });

  it('does NOT flag light gray weights (gray-000/50/100/200/300) used for text', () => {
    // These are light surfaces or inverted text, not dark body text that
    // disappears on a dark surface — out of scope for the dark-text rule.
    const css = `
.a { color: var(--rsd-color-gray-000); }
.b { color: var(--rsd-color-gray-50); }
.c { color: var(--rsd-color-gray-100); }
.d { color: var(--rsd-color-gray-200); }
.e { color: var(--rsd-color-gray-300); }
`;
    expect(findThemeTokenViolations(css)).toEqual([]);
  });

  it('flags a DARK hardcoded hex used for text color', () => {
    const css = `.muted { color: #4b5563; }`;
    const violations = findThemeTokenViolations(css);
    expect(violations).toHaveLength(1);
    expect(violations[0].value).toBe('#4b5563');
  });

  it('does NOT flag a LIGHT hardcoded hex used for text color', () => {
    // A light hex (e.g. inverted #fff/#f9fafa text) is not a dark-text bug.
    const css = `
.a { color: #ffffff; }
.b { color: #f9fafa; }
`;
    expect(findThemeTokenViolations(css)).toEqual([]);
  });

  it('does NOT flag a semantic status hue (red/green/orange/blue) used for text', () => {
    // Non-gray hue scales are intentional semantic status colors (ErrorMessage
    // red, Note variants, validation success/error). The scan targets only the
    // neutral gray scale + dark hex, so these never trip.
    const css = `
.error { color: var(--rsd-color-red-500); }
.success { color: var(--rsd-color-green-600); }
.warning { color: var(--rsd-color-orange-500); }
.info { color: var(--rsd-color-blue-500); }
`;
    expect(findThemeTokenViolations(css)).toEqual([]);
  });

  it('does NOT flag inverted light text on a colored/dark background', () => {
    // Badge chips / primary Button labels: light foreground on a colored surface.
    const css = `
.badge {
  color: var(--rsd-color-gray-000);
  background-color: var(--rsd-color-primary-600);
}
`;
    expect(findThemeTokenViolations(css)).toEqual([]);
  });

  it('does NOT flag DARK text when the same rule sets a background-color', () => {
    // A self-contained chip/panel carries its own surface, so its foreground is
    // component-local and exempt (e.g. a code chip on a fixed light background).
    const css = `
.chip {
  color: var(--rsd-color-gray-800);
  background-color: var(--rsd-color-gray-100);
}
`;
    expect(findThemeTokenViolations(css)).toEqual([]);
  });

  it('does flag DARK text when the rule only sets a transparent background', () => {
    const css = `
.text {
  color: var(--rsd-color-gray-800);
  background: transparent;
}
`;
    expect(findThemeTokenViolations(css)).toHaveLength(1);
  });

  it('does NOT flag text that a [data-theme="dark"] override re-declares', () => {
    // Components like Tabs/Modal hand-tune their dark-mode text with an override
    // rule; the base declaration already adapts and is exempt.
    const css = `
.trigger {
  color: var(--rsd-color-gray-600);
  background: transparent;
}

[data-theme="dark"] .trigger {
  color: var(--rsd-component-text-reverse-color);
}
`;
    expect(findThemeTokenViolations(css)).toEqual([]);
  });

  it('exempts a dark-overridden selector even when a CSS comment precedes it', () => {
    // Comments between rules must not leak into the selector key and break the
    // base-vs-override match.
    const css = `
/* Individual Tab Trigger button */
.trigger {
  color: var(--rsd-color-gray-600);
  background: transparent;
}

/* Dark mode support */
[data-theme="dark"] .trigger {
  color: var(--rsd-component-text-reverse-color);
}
`;
    expect(findThemeTokenViolations(css)).toEqual([]);
  });

  it('still flags a DARK gray text with no matching dark override', () => {
    // A dark override for a DIFFERENT selector does not exempt this one.
    const css = `
.description {
  color: var(--rsd-color-gray-500);
}

[data-theme="dark"] .title {
  color: var(--rsd-component-text-reverse-color);
}
`;
    const violations = findThemeTokenViolations(css);
    expect(violations).toHaveLength(1);
    expect(violations[0].value).toBe('var(--rsd-color-gray-500)');
  });

  it('does not flag a fixed hue scale on a non-color property', () => {
    const css = `
.unreadDot {
  background-color: var(--rsd-color-blue-600);
  border-color: var(--rsd-color-gray-700);
}
`;
    expect(findThemeTokenViolations(css)).toEqual([]);
  });

  it('does not flag the primary brand-accent scale used for text color', () => {
    const css = `
.summaryToggle:hover .summaryText {
  color: var(--rsd-color-primary-600);
}
`;
    expect(findThemeTokenViolations(css)).toEqual([]);
  });

  it('reports the 1-based line number of each violation', () => {
    const css = `.a {\n  color: var(--rsd-color-gray-900);\n}\n.b {\n  color: #111827;\n}\n`;
    const violations = findThemeTokenViolations(css);
    expect(violations.map((v) => v.line)).toEqual([2, 5]);
  });
});

describe('isDarkHex — luminance threshold', () => {
  it('treats dark grays/blacks as dark', () => {
    expect(isDarkHex('#000')).toBe(true);
    expect(isDarkHex('#4b5563')).toBe(true);
    expect(isDarkHex('#6b7280')).toBe(true);
  });

  it('treats whites/near-whites as not dark', () => {
    expect(isDarkHex('#fff')).toBe(false);
    expect(isDarkHex('#ffffff')).toBe(false);
    expect(isDarkHex('#f9fafa')).toBe(false);
  });
});

describe('darkThemeColorSelectors', () => {
  it('collects selectors with a [data-theme="dark"] color override, comment-safe', () => {
    const css = `
/* base */
.trigger { color: var(--rsd-color-gray-600); }
/* dark */
[data-theme="dark"] .trigger { color: var(--rsd-component-text-reverse-color); }
[data-theme="dark"] .other { background-color: #000; }
`;
    const selectors = darkThemeColorSelectors(css);
    expect(selectors.has('.trigger')).toBe(true);
    // `.other` sets only a background-color under the dark scope — not a color
    // override, so it is not collected.
    expect(selectors.has('.other')).toBe(false);
  });
});

describe('partitionByBaseline — baseline behavior', () => {
  it('treats a baselined violation as tolerated (no new violation)', () => {
    const violations = [{ line: 10, value: 'var(--rsd-color-gray-500)' }];
    const baseline = [{ line: 10, value: 'var(--rsd-color-gray-500)' }];
    const { newViolations, matchedBaseline } = partitionByBaseline(
      violations,
      baseline
    );
    expect(newViolations).toEqual([]);
    expect(matchedBaseline).toHaveLength(1);
  });

  it('matches a baselined violation even if its line number shifts', () => {
    // Matching is on `value`, so an unrelated edit above it does not resurrect it.
    const violations = [{ line: 42, value: 'var(--rsd-color-gray-500)' }];
    const baseline = [{ line: 10, value: 'var(--rsd-color-gray-500)' }];
    const { newViolations } = partitionByBaseline(violations, baseline);
    expect(newViolations).toEqual([]);
  });

  it('reports a NEW (non-baselined) violation as failing', () => {
    const violations = [
      { line: 10, value: 'var(--rsd-color-gray-500)' },
      { line: 20, value: 'var(--rsd-color-gray-800)' },
    ];
    const baseline = [{ line: 10, value: 'var(--rsd-color-gray-500)' }];
    const { newViolations } = partitionByBaseline(violations, baseline);
    expect(newViolations).toEqual([
      { line: 20, value: 'var(--rsd-color-gray-800)' },
    ]);
  });

  it('does not consume one baseline entry for two identical violations', () => {
    // Two distinct occurrences of the same token — only one is baselined, so the
    // second surfaces as new (guards against a single entry masking a regression).
    const violations = [
      { line: 10, value: 'var(--rsd-color-gray-500)' },
      { line: 30, value: 'var(--rsd-color-gray-500)' },
    ];
    const baseline = [{ line: 10, value: 'var(--rsd-color-gray-500)' }];
    const { newViolations } = partitionByBaseline(violations, baseline);
    expect(newViolations).toHaveLength(1);
    expect(newViolations[0].line).toBe(30);
  });

  it('reports every violation as new when the baseline entries are empty', () => {
    // With the migration complete the baseline is `{}`, so each module is
    // validated against an empty entry list. Any residual dark text must surface
    // as a new violation rather than being silently tolerated.
    const violations = [{ line: 10, value: 'var(--rsd-color-gray-500)' }];
    const { newViolations, matchedBaseline } = partitionByBaseline(
      violations,
      []
    );
    expect(newViolations).toEqual(violations);
    expect(matchedBaseline).toEqual([]);
  });
});

describe('empty baseline — the fully-migrated end state', () => {
  it('ships an empty baseline (all batches migrated)', () => {
    // Once every scanned module is on adaptive tokens the baseline is `{}`; a
    // non-empty baseline here means an un-migrated module slipped back in.
    expect(loadBaseline()).toEqual({});
  });

  it('every scanned module passes against the empty baseline', () => {
    // The guardrail is now fully enforcing: with no tolerated entries, no
    // in-scope CSS module may carry a fixed dark-color text declaration.
    const rootDir = path.resolve(__dirname, '../../..');
    const offenders = scannedModules().filter((relPath) => {
      const result = validateModuleFile(path.join(rootDir, relPath), []);
      return !result.ok;
    });
    expect(offenders).toEqual([]);
  });
});

describe('scan roots — squareone App Router pages (src/app)', () => {
  const rootDir = path.resolve(__dirname, '../../..');

  it('includes the squareone app root alongside the two component roots', () => {
    expect(SCAN_ROOTS).toContain('apps/squareone/src/app');
    expect(SCAN_ROOTS).toContain('apps/squareone/src/components');
    expect(SCAN_ROOTS).toContain('packages/squared/src/components');
  });

  it('discovers page-local *.module.css files under src/app', () => {
    // The App Router root is glob-walked, so page-local modules (which live
    // outside the two **/components/** roots) are now in scope.
    const modules = scannedModules();
    expect(modules.some((p) => p.startsWith('apps/squareone/src/app/'))).toBe(
      true
    );
  });

  it('detects a fixed dark-gray text violation in an app-page module', () => {
    // Prove the new scan root actually surfaces a violation: write an
    // unmigrated app-page module under src/app and validate it against the
    // empty baseline the way the scanner does.
    const tmpDir = fs.mkdtempSync(
      path.join(rootDir, 'apps/squareone/src/app/__theme_token_test_')
    );
    const tmpFile = path.join(tmpDir, 'Offending.module.css');
    try {
      fs.writeFileSync(
        tmpFile,
        '.muted {\n  color: var(--rsd-color-gray-600, #4b5563);\n}\n'
      );
      const result = validateModuleFile(tmpFile, []);
      expect(result.ok).toBe(false);
      expect(result.newViolations).toHaveLength(1);
      expect(result.newViolations[0].value).toBe('#4b5563');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
