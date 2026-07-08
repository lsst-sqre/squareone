#!/usr/bin/env node

/**
 * Guards the notification CSS modules against re-introducing fixed color-scale
 * tokens or hardcoded hex colors for text.
 *
 * Dark mode in squareone only re-maps the adaptive semantic `--rsd-component-*`
 * tokens (via `tokens.dark.css`, applied through `data-theme="dark"`). The raw
 * `--rsd-color-<hue>-<weight>` scale tokens are identical in both themes, so any
 * text `color:` pinned to a fixed scale token — or to a hardcoded hex — will not
 * adapt and renders illegibly in dark mode. DM-55433 migrated the notification
 * modules onto adaptive tokens; this guardrail keeps them there.
 *
 * A violation is a CSS `color:` declaration (text color only — `background-color`
 * and other properties are out of scope) whose value contains either:
 *   - a fixed neutral/status hue-scale token: `var(--rsd-color-<hue>-<weight>)`
 *     where <hue> is one of the raw scales (gray, red, blue, green, yellow,
 *     orange, purple); or
 *   - a hardcoded hex literal (`#rgb`, `#rrggbb`, `#rrggbbaa`).
 *
 * The Rubin brand-accent scale `--rsd-color-primary-*` is a semantic alias (not a
 * fixed neutral/status hue) and is intentionally NOT flagged: pre-existing
 * link/hover affordances legitimately use it, and it is out of scope per the PRD.
 *
 * Scope is limited to the notification CSS modules (PRD out-of-scope note).
 *
 * Exit codes:
 * - 0: no violations found
 * - 1: at least one violation found
 * - 2: validation error (missing files, read errors)
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

// Notification CSS modules guarded by this script (relative to repo root). Kept
// explicit — the guardrail's scope is deliberately limited to these files.
const NOTIFICATION_CSS_MODULES = [
  'apps/squareone/src/components/AdminNotifications/NotificationFilters.module.css',
  'apps/squareone/src/components/AdminNotifications/NotificationsTableView.module.css',
  'apps/squareone/src/components/NotificationDetailView/NotificationDetailView.module.css',
  'apps/squareone/src/components/NotificationForm/NotificationForm.module.css',
  'apps/squareone/src/components/UserNotifications/UserNotificationDetailView.module.css',
  'apps/squareone/src/components/UserNotifications/UserNotificationsTableView.module.css',
];

// Fixed neutral/status hue scales whose tokens do NOT adapt across themes.
// `primary` is deliberately excluded — it is the Rubin brand-accent alias.
const FIXED_HUE_SCALES = [
  'gray',
  'red',
  'blue',
  'green',
  'yellow',
  'orange',
  'purple',
];

// A `color:` declaration value that pins a fixed hue-scale token, e.g.
// `color: var(--rsd-color-gray-800)`. Matches `color:` on a property boundary so
// `background-color:` (and other `*-color:` properties) are excluded.
const FIXED_SCALE_TOKEN_RE = new RegExp(
  `(?:^|[^-\\w])color:\\s*(var\\(\\s*--rsd-color-(?:${FIXED_HUE_SCALES.join(
    '|'
  )})-\\d{2,3}\\s*\\))`,
  'i'
);

// A `color:` declaration value that pins a hardcoded hex literal, e.g.
// `color: #4b5563`. Same property-boundary handling excludes `background-color:`.
const HEX_TEXT_COLOR_RE = /(?:^|[^-\w])color:\s*(#[0-9a-f]{3,8})\b/i;

/**
 * Find fixed-scale / hardcoded-hex text-color violations in a CSS source string.
 *
 * Text color only: a value is a violation when it is assigned to the `color`
 * property (not `background-color` or any other `*-color` property). Returns one
 * entry per offending line with the 1-based line number and the offending value.
 *
 * @param {string} cssText - Raw CSS module contents.
 * @returns {{ line: number, value: string }[]} Violations, in file order.
 */
function findThemeTokenViolations(cssText) {
  const violations = [];
  const lines = cssText.split('\n');

  lines.forEach((line, index) => {
    const scaleMatch = line.match(FIXED_SCALE_TOKEN_RE);
    if (scaleMatch) {
      violations.push({ line: index + 1, value: scaleMatch[1] });
    }

    const hexMatch = line.match(HEX_TEXT_COLOR_RE);
    if (hexMatch) {
      violations.push({ line: index + 1, value: hexMatch[1] });
    }
  });

  return violations;
}

/**
 * Validate a single CSS module file on disk.
 *
 * @param {string} absPath - Absolute path to the CSS module.
 * @returns {{ ok: boolean, error?: boolean, violations: { line: number, value: string }[] }}
 */
function validateModuleFile(absPath) {
  let cssText;
  try {
    cssText = fs.readFileSync(absPath, 'utf8');
  } catch (error) {
    console.error(
      `${colors.red}✗${colors.reset} Failed to read ${absPath}: ${error.message}`
    );
    return { ok: false, error: true, violations: [] };
  }

  const violations = findThemeTokenViolations(cssText);
  return { ok: violations.length === 0, violations };
}

/**
 * Main execution
 */
function main() {
  console.log(`${colors.bold}Theme Token Validator${colors.reset}`);
  console.log(
    `Checking ${NOTIFICATION_CSS_MODULES.length} notification CSS module(s) for fixed color-scale tokens and hardcoded hex text colors\n`
  );

  let totalViolations = 0;
  let hadReadError = false;

  for (const relPath of NOTIFICATION_CSS_MODULES) {
    const absPath = path.join(rootDir, relPath);
    const result = validateModuleFile(absPath);

    if (result.error) {
      hadReadError = true;
      continue;
    }

    if (result.ok) {
      console.log(`${colors.green}✓${colors.reset} ${relPath}`);
    } else {
      console.error(`${colors.red}✗${colors.reset} ${relPath}`);
      for (const { line, value } of result.violations) {
        console.error(
          `    ${colors.yellow}line ${line}:${colors.reset} fixed color used for text: ${value}`
        );
        totalViolations++;
      }
    }
  }

  if (hadReadError) {
    console.error(
      `\n${colors.red}✗ Could not read one or more notification CSS modules${colors.reset}\n`
    );
    process.exit(2);
  }

  console.log(`\n${colors.bold}Summary:${colors.reset}`);
  console.log(`  Modules checked: ${NOTIFICATION_CSS_MODULES.length}`);

  if (totalViolations === 0) {
    console.log(
      `  ${colors.green}✓ No fixed color-scale tokens or hardcoded hex text colors found!${colors.reset}\n`
    );
    process.exit(0);
  }

  console.log(
    `  ${colors.red}✗ Found ${totalViolations} fixed-color text violation(s)${colors.reset}\n`
  );
  console.log(`${colors.yellow}To fix:${colors.reset}`);
  console.log(
    `  Replace the fixed color-scale token or hardcoded hex used for text with an`
  );
  console.log(`  adaptive semantic token so it re-maps in dark mode:`);
  console.log(`    - primary text   → var(--rsd-component-text-color)`);
  console.log(
    `    - muted/secondary → var(--rsd-component-text-secondary-color)\n`
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
  NOTIFICATION_CSS_MODULES,
};
