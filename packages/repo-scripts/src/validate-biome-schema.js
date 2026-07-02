#!/usr/bin/env node

/**
 * Validates that biome.json's `$schema` version matches the installed
 * @biomejs/biome version.
 *
 * When a dependency bump moves @biomejs/biome to a new version, biome.json's
 * `$schema` URL keeps pointing at the old version until `biome migrate` is run.
 * Biome only surfaces this as an info-level lint diagnostic, which is easy to
 * miss, so this check turns the drift into a hard failure in CI and pre-commit.
 *
 * Source of truth is the *installed* Biome version (what the binary reports and
 * what `biome migrate` writes into `$schema`), so a passing check guarantees
 * `biome migrate` would be a no-op.
 *
 * Exit codes:
 * - 0: `$schema` matches the installed Biome (or nothing to check)
 * - 1: Version mismatch found
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
 * Extract the version from a Biome `$schema` URL such as
 * "https://biomejs.dev/schemas/2.3.14/schema.json".
 * @param {string} schema - The `$schema` string.
 * @returns {string|null} - The X.Y.Z version, or null if not found.
 */
function extractSchemaVersion(schema) {
  if (!schema) return null;
  const match = schema.match(/schemas\/(\d+\.\d+\.\d+)\/schema\.json/);
  return match ? match[1] : null;
}

/**
 * Extract an X.Y.Z version from a dependency range such as "^2.3.14".
 * @param {string} range
 * @returns {string|null}
 */
function extractVersion(range) {
  if (!range) return null;
  const match = range.match(/(\d+\.\d+\.\d+)/);
  return match ? match[1] : null;
}

/**
 * Read the `$schema` version declared in biome.json / biome.jsonc.
 *
 * The `$schema` value is pulled with a regex rather than JSON.parse so a JSONC
 * config with comments still parses.
 *
 * @param {string} rootDir - Repository root.
 * @returns {{ path: string, version: string|null }|null} - null if no config found.
 */
function readConfigSchemaVersion(rootDir) {
  const candidates = ['biome.json', 'biome.jsonc'];
  for (const name of candidates) {
    const configPath = path.join(rootDir, name);
    if (!fs.existsSync(configPath)) continue;

    const content = fs.readFileSync(configPath, 'utf8');
    const match = content.match(/"\$schema"\s*:\s*"([^"]+)"/);
    return { path: configPath, version: extractSchemaVersion(match?.[1]) };
  }
  return null;
}

/**
 * Resolve the Biome version to validate against.
 *
 * Prefers the installed package (`node_modules/@biomejs/biome/package.json`,
 * matching what the binary reports and what `biome migrate` writes). Falls back
 * to the root package.json devDependency range when node_modules is absent.
 *
 * @param {string} rootDir - Repository root.
 * @returns {{ version: string, source: string }|null}
 */
function readInstalledBiomeVersion(rootDir) {
  const installedPath = path.join(
    rootDir,
    'node_modules/@biomejs/biome/package.json'
  );
  if (fs.existsSync(installedPath)) {
    try {
      const version = JSON.parse(
        fs.readFileSync(installedPath, 'utf8')
      ).version;
      if (version) return { version, source: 'installed @biomejs/biome' };
    } catch (_error) {
      // Fall through to the package.json fallback.
    }
  }

  // Fallback: the declared devDependency range in the root package.json.
  const rootPackagePath = path.join(rootDir, 'package.json');
  try {
    const pkg = JSON.parse(fs.readFileSync(rootPackagePath, 'utf8'));
    const declared =
      pkg.devDependencies?.['@biomejs/biome'] ||
      pkg.dependencies?.['@biomejs/biome'];
    const version = extractVersion(declared);
    if (version) {
      return { version, source: 'package.json @biomejs/biome (not installed)' };
    }
  } catch (_error) {
    // Reported by the caller as a validation error.
  }

  return null;
}

/**
 * Main execution
 */
function main() {
  // Repo root, resolved from this script's home in packages/repo-scripts/src.
  const rootDir = path.resolve(__dirname, '../../..');

  console.log(`${colors.bold}Biome Schema Validator${colors.reset}`);

  const config = readConfigSchemaVersion(rootDir);
  if (!config) {
    console.log(
      `${colors.yellow}⚠${colors.reset} No biome.json / biome.jsonc found; nothing to validate`
    );
    process.exit(0);
  }

  const relativeConfigPath = path.relative(rootDir, config.path);
  console.log(
    `\n${colors.blue}Validating:${colors.reset} ${relativeConfigPath}`
  );

  const installed = readInstalledBiomeVersion(rootDir);
  if (!installed) {
    console.error(
      `${colors.red}✗${colors.reset} Could not resolve the @biomejs/biome version to validate against`
    );
    process.exit(2);
  }

  console.log(
    `${colors.blue}Against:${colors.reset} Biome ${installed.version} (${installed.source})`
  );

  if (!config.version) {
    console.error(
      `  ${colors.red}✗${colors.reset} biome.json has no recognizable "$schema" version`
    );
    console.error(
      `    Expected a URL like https://biomejs.dev/schemas/${installed.version}/schema.json`
    );
    printFixHint();
    process.exit(1);
  }

  if (config.version === installed.version) {
    console.log(
      `  ${colors.green}✓${colors.reset} $schema ${config.version} matches Biome ${installed.version}`
    );
    console.log(
      `\n${colors.bold}Summary:${colors.reset} ${colors.green}✓ Biome schema is in sync${colors.reset}\n`
    );
    process.exit(0);
  }

  console.error(
    `  ${colors.red}✗${colors.reset} Biome $schema version mismatch:`
  );
  console.error(`    biome.json $schema: ${config.version}`);
  console.error(`    installed Biome:    ${installed.version}`);
  printFixHint();
  process.exit(1);
}

/**
 * Print the remediation hint (command + skill).
 */
function printFixHint() {
  console.log(`\n${colors.yellow}To fix:${colors.reset}`);
  console.log(
    `  1. Run ${colors.bold}pnpm exec biome migrate --write${colors.reset} to sync biome.json's $schema, or`
  );
  console.log(
    `  2. Use the ${colors.bold}biome-migrate${colors.reset} skill (.claude/skills/biome-migrate)`
  );
  console.log('');
}

// Run if executed directly
if (require.main === module) {
  main();
}

// Export for testing
module.exports = {
  extractSchemaVersion,
  extractVersion,
  readConfigSchemaVersion,
  readInstalledBiomeVersion,
};
