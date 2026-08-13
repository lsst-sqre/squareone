#!/usr/bin/env node

/**
 * Validates the root package.json's pnpm configuration.
 *
 * The pnpm version lives in three places that must move together: the
 * packageManager field (what corepack activates), engines.pnpm (what a
 * standalone pnpm checks before touching the lockfile), and the Dockerfile's
 * corepack prepare line (covered by validate-docker-versions.js). This script
 * closes the engines leg, which no other validator checks:
 *
 * - engines.pnpm must be exactly ">=<packageManager version> <(major+1)".
 *   Requiring the floor to equal the pinned version keeps the hand-maintained
 *   range from drifting when packageManager is bumped, and the next-major
 *   ceiling makes a standalone pnpm from the wrong major hard-fail the
 *   engines check instead of rewriting the lockfile incompatibly.
 *
 * - The root package.json must not contain a "pnpm" field. pnpm 11 only
 *   reads pnpm settings (overrides, allowBuilds, ...) from
 *   pnpm-workspace.yaml; a "pnpm" block copy-pasted into package.json is
 *   ignored with nothing but an easy-to-miss install-time warning. That
 *   exact drift once left the workspace's security overrides ineffective
 *   for months, so this check turns it into a hard failure.
 *
 * Exit codes:
 * - 0: Configuration is valid
 * - 1: Validation failures found
 * - 2: Validation error (missing files, parse errors)
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

/**
 * Extract the X.Y.Z version from a packageManager string such as
 * "pnpm@11.21.0+sha512...".
 * @param {string} packageManager
 * @returns {string|null}
 */
function extractPackageManagerVersion(packageManager) {
  if (!packageManager) return null;
  const match = packageManager.match(/^pnpm@(\d+\.\d+\.\d+)/);
  return match ? match[1] : null;
}

/**
 * The engines.pnpm range required for a given pinned pnpm version: the pin
 * as the floor, bounded below the next major.
 * @param {string} version - The packageManager X.Y.Z version.
 * @returns {string}
 */
function expectedEnginesRange(version) {
  const major = Number(version.split('.')[0]);
  return `>=${version} <${major + 1}`;
}

/**
 * Validate the pnpm configuration of a parsed package.json.
 * @param {object} pkg - Parsed root package.json.
 * @returns {{ ok: boolean, failures: string[], checks: string[] }}
 */
function validatePnpmConfig(pkg) {
  const failures = [];
  const checks = [];

  const pinned = extractPackageManagerVersion(pkg.packageManager);
  if (!pinned) {
    failures.push(
      'packageManager must pin pnpm as "pnpm@X.Y.Z..." so corepack, ' +
        'engines.pnpm, and the Dockerfile share one source of truth'
    );
    return { ok: false, failures, checks };
  }
  checks.push(`packageManager pins pnpm ${pinned}`);

  const engines = pkg.engines?.pnpm;
  const expected = expectedEnginesRange(pinned);
  if (engines !== expected) {
    failures.push(
      `engines.pnpm must be "${expected}" to match packageManager ` +
        `pnpm@${pinned} (found: ${engines ? `"${engines}"` : 'no engines.pnpm'})`
    );
  } else {
    checks.push(`engines.pnpm "${engines}" matches packageManager`);
  }

  if ('pnpm' in pkg) {
    const keys = Object.keys(pkg.pnpm ?? {})
      .map((key) => `pnpm.${key}`)
      .join(', ');
    failures.push(
      'package.json must not contain a "pnpm" field' +
        (keys ? ` (found: ${keys})` : '') +
        '; pnpm 11 only reads these settings from pnpm-workspace.yaml, so ' +
        'entries here are ignored with only an install-time warning'
    );
  } else {
    checks.push('no "pnpm" field shadowing pnpm-workspace.yaml');
  }

  return { ok: failures.length === 0, failures, checks };
}

/**
 * Main execution
 */
function main() {
  // Repo root, resolved from this script's home in packages/repo-scripts/src.
  const rootDir = path.resolve(__dirname, '../../..');
  const packageJsonPath = path.join(rootDir, 'package.json');

  console.log(`${colors.bold}pnpm Config Validator${colors.reset}`);
  console.log(
    `\n${colors.blue}Validating:${colors.reset} ${path.relative(
      rootDir,
      packageJsonPath
    )}`
  );

  let pkg;
  try {
    pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  } catch (error) {
    console.error(
      `${colors.red}✗${colors.reset} Failed to parse ${packageJsonPath}: ${error.message}`
    );
    process.exit(2);
  }

  const result = validatePnpmConfig(pkg);

  for (const check of result.checks) {
    console.log(`  ${colors.green}✓${colors.reset} ${check}`);
  }
  for (const failure of result.failures) {
    console.error(`  ${colors.red}✗${colors.reset} ${failure}`);
  }

  if (result.ok) {
    console.log(
      `\n${colors.bold}Summary:${colors.reset} ${colors.green}✓ pnpm configuration is in sync${colors.reset}\n`
    );
    process.exit(0);
  }

  console.log(`\n${colors.yellow}To fix:${colors.reset}`);
  console.log(
    `  - Keep packageManager as the source of truth and update engines.pnpm to`
  );
  console.log(
    `    ">=<packageManager version> <(major+1)". The Dockerfile leg of the`
  );
  console.log(`    sync is checked by validate-docker-versions.js.`);
  console.log(
    `  - Move any "pnpm" settings (overrides, allowBuilds, ...) from`
  );
  console.log(`    package.json into pnpm-workspace.yaml.\n`);
  process.exit(1);
}

// Run if executed directly
if (require.main === module) {
  main();
}

// Export for testing
module.exports = {
  extractPackageManagerVersion,
  expectedEnginesRange,
  validatePnpmConfig,
};
