#!/usr/bin/env node

/**
 * Guards CSS modules against re-introducing fixed color-scale tokens or hardcoded
 * hex colors for text that won't adapt to dark mode.
 *
 * Dark mode in squareone only re-maps the adaptive semantic `--rsd-component-*`
 * tokens (via `tokens.dark.css`, applied through `data-theme="dark"`). The raw
 * `--rsd-color-<hue>-<weight>` scale tokens are identical in both themes, so any
 * DARK text `color:` pinned to a fixed dark scale token — or to a dark hardcoded
 * hex — stays dark on the (adaptive) dark surface and renders illegibly in dark
 * mode. DM-55433 migrated the notification modules onto adaptive tokens and then
 * the shared `DataTable`/`KeyValueList` and app-local `SentryConfigInfo`; this
 * guardrail keeps them there and extends the scan to the whole squared component
 * library, the squareone app component modules, and the squareone App Router
 * pages (`src/app`) so new regressions are caught.
 *
 * ---------------------------------------------------------------------------
 * PRINCIPLED DETECTION RULE (deliberately narrow, to stay low-noise)
 * ---------------------------------------------------------------------------
 * A violation is a CSS `color:` declaration (TEXT color only — `background-color`,
 * `border-color`, `outline-color`, `fill`, `stroke`, box-shadow are all out of a
 * `color:` check) whose value is a FIXED DARK foreground that will not adapt:
 *
 *   - a fixed DARK neutral gray-scale token: `var(--rsd-color-gray-<weight>)`
 *     with <weight> in 400..900 (the dark end of the scale). Light weights
 *     `gray-000`/`gray-50`/`gray-100`/`gray-200`/`gray-300` are NOT flagged: they
 *     are light surfaces or inverted (on-colored-background) text, not dark body
 *     text that disappears on a dark surface; or
 *   - a DARK hardcoded hex literal (`#rgb`/`#rrggbb`/`#rrggbbaa`) — one whose
 *     relative luminance is below a mid-gray threshold (see `isDarkHex`). A light
 *     hex (e.g. `#fff`) used as inverted text is not a dark-mode text bug.
 *
 * Two classes are INTENTIONALLY NOT flagged, because they read acceptably in both
 * themes and are the design intent rather than a bug:
 *
 *   1. INVERTED TEXT ON A COLORED/DARK BACKGROUND. If the same rule block also
 *      sets a non-transparent `background-color:`, the text color is contextual
 *      (a chip/label/button surface carries its own foreground) and is exempt.
 *      This auto-exempts `Badge` chips, primary `Button` labels, etc. — light
 *      `gray-000`/`gray-50` on a colored surface never trips the rule, and even a
 *      dark foreground paired with a background is treated as component-local.
 *   1b. ALREADY-ADAPTED VIA A DARK-THEME OVERRIDE. If the module contains a
 *      `[data-theme="dark"] <selector>` (or `.dark <selector>` / `body.dark …`)
 *      rule that re-declares `color:` for the SAME selector, the base declaration
 *      already adapts and is exempt. This exempts components like `Tabs`, `Modal`,
 *      and `ClipboardButton` that hand-tune their dark-mode text rather than lean
 *      on adaptive tokens — a valid pattern the guardrail should not fight.
 *   2. INTENTIONAL SEMANTIC STATUS COLORS. Red/green/orange/blue/yellow/purple
 *      hue-scale text is the whole job of components like `ErrorMessage` (red),
 *      `Note` (info/success/warning variants), `Badge` status variants, and form
 *      validation error/success text. Rather than blanket-flag every status hue
 *      (noisy and wrong), this scan flags ONLY the neutral gray scale + dark hex.
 *      Non-gray hue scales are not treated as violations at all. (The notification
 *      modules that formerly used red/blue callouts were migrated to squared
 *      `ErrorMessage`/`Note`, so they no longer carry raw status-hue text.)
 *
 * The Rubin brand-accent scale `--rsd-color-primary-*` is a semantic alias (not a
 * fixed neutral scale) and is never flagged: pre-existing link/hover affordances
 * legitimately use it.
 *
 * ---------------------------------------------------------------------------
 * BASELINE (keeps CI green while the migration is incremental)
 * ---------------------------------------------------------------------------
 * The broadened scan covers the whole squared library and the squareone app,
 * where many pre-existing dark-gray text colors remain unmigrated. Fixing them
 * all is out of scope for the guardrail change (that is the audit's purpose), so
 * a documented BASELINE (see `baseline.json`, loaded below) enumerates the
 * currently-known real violations that remain. A baselined `{file, value}` on its
 * expected line passes; ANY new (non-baselined) violation, or a baselined one
 * that moved/changed, FAILS. The baseline is the actionable "needs adjustment"
 * list — shrink it as components migrate; the guardrail then locks in the win.
 *
 * Exit codes:
 * - 0: no un-baselined violations found
 * - 1: at least one un-baselined violation (new regression) found
 * - 2: validation error (missing files, read errors, stale baseline entry)
 */

const fs = require('node:fs');
const path = require('node:path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
};

// Repo root, resolved from this script's home in packages/repo-scripts/src.
const rootDir = path.resolve(__dirname, '../../..');

// Notification CSS modules originally guarded (relative to repo root). These stay
// explicit; the rest of the scope is discovered by glob (see collectCssModules).
const NOTIFICATION_CSS_MODULES = [
  'apps/squareone/src/components/AdminNotifications/NotificationFilters.module.css',
  'apps/squareone/src/components/AdminNotifications/NotificationsTableView.module.css',
  'apps/squareone/src/components/NotificationDetailView/NotificationDetailView.module.css',
  'apps/squareone/src/components/NotificationForm/NotificationForm.module.css',
  'apps/squareone/src/components/UserNotifications/UserNotificationDetailView.module.css',
  'apps/squareone/src/components/UserNotifications/UserNotificationsTableView.module.css',
];

// Directories whose *.module.css files are recursively scanned (relative to repo
// root). The notification modules live under the first; broadening to the whole
// tree here also covers the squared component library and the squareone app's
// App Router pages (`src/app`), whose page-local modules can also carry
// dark-mode text bugs.
const SCAN_ROOTS = [
  'apps/squareone/src/components',
  'apps/squareone/src/app',
  'packages/squared/src/components',
];

// The lowest (lightest) gray weight that counts as DARK text. Weights at or above
// this are dark foregrounds that stay dark on a dark surface; lighter weights are
// surfaces or inverted text and are out of scope for this check.
const DARK_GRAY_MIN_WEIGHT = 400;

// Luminance threshold below which a hardcoded hex counts as DARK text. Uses the
// WCAG relative-luminance formula; 0.4 sits comfortably above mid-gray so light
// (inverted) text like #fff/#f9fafa is excluded while body grays are caught.
const DARK_HEX_LUMINANCE_MAX = 0.4;

/**
 * Match a `color:` declaration on a property boundary so `background-color:` and
 * other `*-color:` properties are excluded. Capture group 1 is the raw value up
 * to the terminating `;` or `}` (or end of line).
 */
const COLOR_DECL_RE = /(?:^|[^-\w])color:\s*([^;}\n]+)/i;

// A fixed gray-scale token in a value, capturing the numeric weight.
const GRAY_SCALE_TOKEN_RE = /var\(\s*--rsd-color-gray-(\d{2,3})\s*\)/i;

// A hardcoded hex literal in a value.
const HEX_LITERAL_RE = /#([0-9a-f]{3,8})\b/i;

/**
 * Expand a 3-digit hex (`#abc`) to 6 digits and return {r,g,b} in 0..255, or null
 * if the string is not a parseable 3/6/8-digit hex.
 *
 * @param {string} hex - Hex literal including the leading `#`.
 * @returns {{ r: number, g: number, b: number } | null}
 */
function parseHex(hex) {
  let h = hex.replace(/^#/, '').toLowerCase();
  if (h.length === 8) h = h.slice(0, 6); // drop alpha
  if (h.length === 3) {
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  }
  if (h.length !== 6 || /[^0-9a-f]/.test(h)) return null;
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

/**
 * WCAG relative luminance of a hex color, in 0..1 (0 = black, 1 = white).
 *
 * @param {string} hex - Hex literal including the leading `#`.
 * @returns {number | null} Luminance, or null if unparseable.
 */
function hexLuminance(hex) {
  const rgb = parseHex(hex);
  if (!rgb) return null;
  const channel = (v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return (
    0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b)
  );
}

/**
 * Whether a hex literal is DARK enough to read as a fixed dark foreground.
 *
 * @param {string} hex - Hex literal including the leading `#`.
 * @returns {boolean}
 */
function isDarkHex(hex) {
  const lum = hexLuminance(hex);
  return lum !== null && lum < DARK_HEX_LUMINANCE_MAX;
}

/**
 * Whether a `color:` value is a FIXED DARK foreground that won't adapt to dark
 * mode: a dark gray-scale token (weight >= DARK_GRAY_MIN_WEIGHT) or a dark hex.
 *
 * @param {string} value - The captured `color:` value (trimmed of surrounding ws).
 * @returns {{ value: string } | null} The offending token/hex, or null.
 */
function classifyColorValue(value) {
  const grayMatch = value.match(GRAY_SCALE_TOKEN_RE);
  if (grayMatch) {
    const weight = Number.parseInt(grayMatch[1], 10);
    if (weight >= DARK_GRAY_MIN_WEIGHT) {
      return { value: grayMatch[0] };
    }
    return null; // light gray weight — surface / inverted text, not a bug
  }

  const hexMatch = value.match(HEX_LITERAL_RE);
  if (hexMatch && isDarkHex(hexMatch[0])) {
    return { value: hexMatch[0] };
  }

  return null;
}

/**
 * Find fixed-dark text-color violations in a CSS source string.
 *
 * A line is a violation when it declares `color:` (text color, not
 * `background-color` or any other `*-color` property) with a fixed dark gray-scale
 * token or a dark hardcoded hex — UNLESS the same rule block also sets a
 * `background-color:` (inverted text on a colored/dark surface is intentional and
 * exempt). Returns one entry per offending line with the 1-based line number and
 * the offending value.
 *
 * @param {string} cssText - Raw CSS module contents.
 * @returns {{ line: number, value: string }[]} Violations, in file order.
 */
function findThemeTokenViolations(cssText) {
  const violations = [];
  const lines = cssText.split('\n');
  const darkOverriddenSelectors = darkThemeColorSelectors(cssText);

  // Track, per top-level rule block, whether it sets a background-color. A simple
  // brace-depth walk is enough for the flat CSS-module rules in this repo: when we
  // enter a block we look ahead to the matching close brace to decide whether the
  // block carries a background.
  lines.forEach((line, index) => {
    const colorMatch = line.match(COLOR_DECL_RE);
    if (!colorMatch) return;

    const classified = classifyColorValue(colorMatch[1]);
    if (!classified) return;

    // Exempt inverted text: if the enclosing rule block also sets a
    // background-color, treat the foreground as component-local/intentional.
    if (ruleBlockHasBackground(lines, index)) return;

    // Exempt already-adapted text: if a `[data-theme="dark"]`/`.dark` rule
    // re-declares `color:` for this same selector, the base value already adapts.
    const selector = ruleSelectorFor(lines, index);
    if (selector && darkOverriddenSelectors.has(selector)) return;

    violations.push({ line: index + 1, value: classified.value });
  });

  return violations;
}

/**
 * The selector of the rule block containing `lines[lineIndex]`, normalized (its
 * combinators/whitespace collapsed to single spaces). Returns null if the line is
 * not inside a rule block. For a light-theme rule this is the "bare" selector; a
 * `[data-theme="dark"]`/`.dark` prefix is stripped by `normalizeSelector` so a
 * base rule and its dark override compare equal.
 *
 * @param {string[]} lines - CSS split into lines.
 * @param {number} lineIndex - 0-based index of a declaration line.
 * @returns {string | null}
 */
function ruleSelectorFor(lines, lineIndex) {
  // Walk up to the opening brace of the enclosing block, collecting the selector
  // text that precedes it (which may span multiple lines).
  let depth = 0;
  for (let i = lineIndex; i >= 0; i--) {
    depth += (lines[i].match(/}/g) || []).length;
    depth -= (lines[i].match(/{/g) || []).length;
    if (depth < 0) {
      // The `{` is on line i; the selector is the text before it, possibly joined
      // with prior lines back to the previous `}` or `{`.
      const braceLine = lines[i];
      const beforeBrace = braceLine.slice(0, braceLine.indexOf('{'));
      const selectorParts = [beforeBrace];
      for (let j = i - 1; j >= 0; j--) {
        if (/[{}]/.test(lines[j])) break;
        selectorParts.unshift(lines[j]);
      }
      return normalizeSelector(selectorParts.join(' '));
    }
  }
  return null;
}

/**
 * Normalize a selector for comparison: collapse whitespace, and strip a leading
 * dark-theme scope (`[data-theme="dark"]`, `.dark`, `body.dark`) so a base rule
 * and its dark-mode override share the same key.
 *
 * @param {string} selector - Raw selector text.
 * @returns {string}
 */
function normalizeSelector(selector) {
  // Strip CSS comments (they can sit between rules and leak into selector text),
  // then collapse whitespace.
  let s = selector
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  s = s
    .replace(/^\[data-theme=["']?dark["']?\]\s*/i, '')
    .replace(/^body\.dark\s*/i, '')
    .replace(/^\.dark\s+/i, '');
  return s.trim();
}

/**
 * Collect the set of (normalized) selectors that a dark-theme rule re-declares
 * `color:` for. A selector in this set has an adaptive dark-mode text override, so
 * its light-theme base `color:` is exempt from the fixed-color check.
 *
 * @param {string} cssText - Raw CSS module contents.
 * @returns {Set<string>} Normalized selectors with a dark-theme `color:` override.
 */
function darkThemeColorSelectors(cssText) {
  const selectors = new Set();
  // Match each rule block whose selector is dark-scoped and whose body sets color.
  const ruleRe = /([^{}]+)\{([^{}]*)\}/g;
  for (const match of cssText.matchAll(ruleRe)) {
    const rawSelector = match[1];
    const body = match[2];
    const isDarkScoped =
      /\[data-theme=["']?dark["']?\]/i.test(rawSelector) ||
      /(^|\s)body\.dark(\s|$)/i.test(rawSelector) ||
      /(^|\s)\.dark\s/i.test(rawSelector);
    if (!isDarkScoped) continue;
    if (!COLOR_DECL_RE.test(body)) continue;
    selectors.add(normalizeSelector(rawSelector));
  }
  return selectors;
}

/**
 * Whether the CSS rule block containing `lines[lineIndex]` also declares a
 * non-transparent `background` or `background-color`. Walks outward from the line
 * to the enclosing `{ ... }` using brace matching.
 *
 * @param {string[]} lines - CSS split into lines.
 * @param {number} lineIndex - 0-based index of the `color:` line.
 * @returns {boolean}
 */
function ruleBlockHasBackground(lines, lineIndex) {
  // Walk up to the opening brace of the enclosing block.
  let start = lineIndex;
  let depth = 0;
  for (let i = lineIndex; i >= 0; i--) {
    depth += (lines[i].match(/}/g) || []).length;
    depth -= (lines[i].match(/{/g) || []).length;
    if (depth < 0) {
      start = i;
      break;
    }
  }

  // Walk down to the closing brace of the enclosing block.
  let end = lineIndex;
  depth = 0;
  for (let i = lineIndex; i < lines.length; i++) {
    depth += (lines[i].match(/{/g) || []).length;
    depth -= (lines[i].match(/}/g) || []).length;
    if (depth < 0) {
      end = i;
      break;
    }
  }

  const block = lines.slice(start, end + 1).join('\n');
  const bgMatch = block.match(/background(?:-color)?:\s*([^;}\n]+)/i);
  if (!bgMatch) return false;
  const bgValue = bgMatch[1].trim().toLowerCase();
  // `transparent` / `none` do not count as a real surface.
  return bgValue !== 'transparent' && bgValue !== 'none';
}

/**
 * Recursively collect `*.module.css` files under a directory (absolute paths).
 *
 * @param {string} absDir - Absolute directory to walk.
 * @returns {string[]} Absolute paths, sorted.
 */
function collectCssModules(absDir) {
  const out = [];
  if (!fs.existsSync(absDir)) return out;
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(abs);
      } else if (entry.isFile() && entry.name.endsWith('.module.css')) {
        out.push(abs);
      }
    }
  };
  walk(absDir);
  return out.sort();
}

/**
 * The full set of CSS module files in scope (relative to repo root, sorted).
 *
 * @returns {string[]}
 */
function scannedModules() {
  const abs = new Set();
  for (const root of SCAN_ROOTS) {
    for (const file of collectCssModules(path.join(rootDir, root))) {
      abs.add(file);
    }
  }
  return [...abs]
    .map((p) => path.relative(rootDir, p))
    .sort()
    .map((p) => p.split(path.sep).join('/'));
}

/**
 * Load the baseline of known, tolerated violations. Shape:
 *   { "<relPath>": [ { "line": <n>, "value": "<token-or-hex>" }, ... ], ... }
 * A missing file is treated as an empty baseline.
 *
 * @returns {Record<string, { line: number, value: string }[]>}
 */
function loadBaseline() {
  const baselinePath = path.join(
    __dirname,
    'validate-theme-tokens.baseline.json'
  );
  if (!fs.existsSync(baselinePath)) return {};
  return JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
}

/**
 * Partition a file's violations into baselined (tolerated) and new (must fail),
 * matching on `value` alone so a baselined violation that merely shifts lines
 * still passes (line is reported for humans but not used to gate).
 *
 * @param {{ line: number, value: string }[]} violations
 * @param {{ line: number, value: string }[]} baselineEntries
 * @returns {{ newViolations: {line:number,value:string}[], matchedBaseline: {line:number,value:string}[] }}
 */
function partitionByBaseline(violations, baselineEntries) {
  const remaining = [...baselineEntries];
  const newViolations = [];
  const matchedBaseline = [];
  for (const v of violations) {
    const idx = remaining.findIndex((b) => b.value === v.value);
    if (idx === -1) {
      newViolations.push(v);
    } else {
      matchedBaseline.push(v);
      remaining.splice(idx, 1);
    }
  }
  return { newViolations, matchedBaseline };
}

/**
 * Validate a single CSS module file on disk against the baseline.
 *
 * @param {string} absPath - Absolute path to the CSS module.
 * @param {{ line: number, value: string }[]} baselineEntries - Tolerated entries.
 * @returns {{ ok: boolean, error?: boolean, newViolations: {line:number,value:string}[], baselinedCount: number }}
 */
function validateModuleFile(absPath, baselineEntries = []) {
  let cssText;
  try {
    cssText = fs.readFileSync(absPath, 'utf8');
  } catch (error) {
    console.error(
      `${colors.red}✗${colors.reset} Failed to read ${absPath}: ${error.message}`
    );
    return { ok: false, error: true, newViolations: [], baselinedCount: 0 };
  }

  const violations = findThemeTokenViolations(cssText);
  const { newViolations, matchedBaseline } = partitionByBaseline(
    violations,
    baselineEntries
  );
  return {
    ok: newViolations.length === 0,
    newViolations,
    baselinedCount: matchedBaseline.length,
  };
}

/**
 * Main execution
 */
function main() {
  const modules = scannedModules();
  const baseline = loadBaseline();

  console.log(`${colors.bold}Theme Token Validator${colors.reset}`);
  console.log(
    `Checking ${modules.length} CSS module(s) across squareone + squared for fixed dark gray-scale tokens and dark hardcoded hex text colors\n`
  );

  let totalNew = 0;
  let totalBaselined = 0;
  let hadReadError = false;

  for (const relPath of modules) {
    const absPath = path.join(rootDir, relPath);
    const result = validateModuleFile(absPath, baseline[relPath] || []);

    if (result.error) {
      hadReadError = true;
      continue;
    }

    totalBaselined += result.baselinedCount;

    if (result.ok) {
      // Only chatter about files that matched the baseline; keep clean output.
      if (result.baselinedCount > 0) {
        console.log(
          `${colors.yellow}~${colors.reset} ${relPath} ${colors.yellow}(${result.baselinedCount} baselined)${colors.reset}`
        );
      }
    } else {
      console.error(`${colors.red}✗${colors.reset} ${relPath}`);
      for (const { line, value } of result.newViolations) {
        console.error(
          `    ${colors.yellow}line ${line}:${colors.reset} fixed dark color used for text: ${value}`
        );
        totalNew++;
      }
    }
  }

  if (hadReadError) {
    console.error(
      `\n${colors.red}✗ Could not read one or more CSS modules${colors.reset}\n`
    );
    process.exit(2);
  }

  console.log(`\n${colors.bold}Summary:${colors.reset}`);
  console.log(`  Modules scanned:   ${modules.length}`);
  console.log(`  Baselined (known): ${totalBaselined}`);

  if (totalNew === 0) {
    console.log(
      `  ${colors.green}✓ No new fixed dark-color text violations!${colors.reset}\n`
    );
    process.exit(0);
  }

  console.log(
    `  ${colors.red}✗ Found ${totalNew} NEW fixed-color text violation(s)${colors.reset}\n`
  );
  console.log(`${colors.yellow}To fix:${colors.reset}`);
  console.log(
    `  Replace the fixed dark gray-scale token or dark hardcoded hex used for text`
  );
  console.log(`  with an adaptive semantic token so it re-maps in dark mode:`);
  console.log(`    - primary text   → var(--rsd-component-text-color)`);
  console.log(
    `    - muted/secondary → var(--rsd-component-text-secondary-color)`
  );
  console.log(
    `    - headings        → var(--rsd-component-text-headline-color)`
  );
  console.log(
    `  Or, if this is intentional (inverted text on a colored background, or a`
  );
  console.log(
    `  semantic status color), pair it with a background-color or add it to the`
  );
  console.log(
    `  baseline (packages/repo-scripts/src/validate-theme-tokens.baseline.json).\n`
  );
  process.exit(1);
}

// Run if executed directly
if (require.main === module) {
  main();
}

// Export for testing
module.exports = {
  findThemeTokenViolations,
  validateModuleFile,
  partitionByBaseline,
  classifyColorValue,
  isDarkHex,
  hexLuminance,
  ruleSelectorFor,
  normalizeSelector,
  darkThemeColorSelectors,
  collectCssModules,
  scannedModules,
  loadBaseline,
  NOTIFICATION_CSS_MODULES,
  SCAN_ROOTS,
  DARK_GRAY_MIN_WEIGHT,
};
