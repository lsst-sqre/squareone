#!/usr/bin/env node

/**
 * Validates that version strings in Dockerfiles match package.json dependencies.
 *
 * Validation rules:
 * - Node.js: Major.minor must match (allows patch differences)
 * - pnpm: Exact version match with packageManager field
 * - Turbo: Exact version match with devDependencies
 *
 * Exit codes:
 * - 0: All versions match
 * - 1: Version mismatches found
 * - 2: Validation error (missing files, parse errors)
 */

const fs = require('fs');
const path = require('path');

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
 * Find all Dockerfiles in the repository
 */
function findDockerfiles(dir, dockerfiles = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    // Skip node_modules, .git, and other build directories
    if (entry.isDirectory()) {
      if (
        ![
          'node_modules',
          '.git',
          'dist',
          'build',
          '.next',
          '.turbo',
          'out',
        ].includes(entry.name)
      ) {
        findDockerfiles(fullPath, dockerfiles);
      }
    } else if (
      entry.name === 'Dockerfile' ||
      entry.name.startsWith('Dockerfile.')
    ) {
      dockerfiles.push(fullPath);
    }
  }

  return dockerfiles;
}

/**
 * Find the appropriate package.json for a given Dockerfile.
 * In a monorepo, looks for package.json with engines/packageManager fields,
 * typically the root package.json.
 */
function findNearestPackageJson(filePath) {
  let currentDir = path.dirname(filePath);
  const rootDir = path.parse(currentDir).root;
  let fallbackPackageJson = null;

  // Walk up directory tree to find package.json with version fields
  while (currentDir !== rootDir) {
    const packageJsonPath = path.join(currentDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      // Read and check if it has the fields we need
      try {
        const content = fs.readFileSync(packageJsonPath, 'utf8');
        const pkg = JSON.parse(content);

        // Keep first package.json as fallback
        if (!fallbackPackageJson) {
          fallbackPackageJson = packageJsonPath;
        }

        // Return this package.json if it has version fields we validate
        if (
          pkg.engines?.node ||
          pkg.packageManager ||
          pkg.devDependencies?.turbo
        ) {
          return packageJsonPath;
        }
      } catch (error) {
        // Continue searching if parse fails
      }
    }
    currentDir = path.dirname(currentDir);
  }

  // Return fallback if we found any package.json
  return fallbackPackageJson;
}

/**
 * Extract version from a version string (handles packageManager format like "pnpm@10.20.0+sha512...")
 */
function extractVersion(versionString) {
  if (!versionString) return null;

  // Handle packageManager format: "pnpm@10.20.0+sha512..."
  const match = versionString.match(/(\d+\.\d+\.\d+)/);
  return match ? match[1] : versionString;
}

/**
 * Parse versions from package.json
 */
function parsePackageJson(packageJsonPath) {
  try {
    const content = fs.readFileSync(packageJsonPath, 'utf8');
    const pkg = JSON.parse(content);

    return {
      node: pkg.engines?.node,
      pnpm: extractVersion(pkg.packageManager),
      turbo: pkg.devDependencies?.turbo,
    };
  } catch (error) {
    console.error(
      `${colors.red}✗${colors.reset} Failed to parse ${packageJsonPath}: ${error.message}`
    );
    return null;
  }
}

/**
 * Parse versions from Dockerfile
 */
function parseDockerfile(dockerfilePath) {
  try {
    const content = fs.readFileSync(dockerfilePath, 'utf8');
    const versions = {
      node: null,
      pnpm: null,
      turbo: null,
    };

    // Extract Node.js version from FROM statement
    const nodeMatch = content.match(/FROM\s+node:(\d+\.\d+\.\d+)/);
    if (nodeMatch) {
      versions.node = nodeMatch[1];
    }

    // Extract pnpm version from corepack prepare
    const pnpmMatch = content.match(
      /corepack\s+prepare\s+pnpm@(\d+\.\d+\.\d+)/
    );
    if (pnpmMatch) {
      versions.pnpm = pnpmMatch[1];
    }

    // Extract turbo version from pnpm dlx turbo@
    const turboMatch = content.match(
      /(?:pnpm\s+dlx|pnpx)\s+turbo@(\d+\.\d+\.\d+)/
    );
    if (turboMatch) {
      versions.turbo = turboMatch[1];
    }

    return versions;
  } catch (error) {
    console.error(
      `${colors.red}✗${colors.reset} Failed to parse ${dockerfilePath}: ${error.message}`
    );
    return null;
  }
}

/**
 * Compare two version strings
 * @param {string} v1 - First version
 * @param {string} v2 - Second version
 * @param {string} matchType - 'exact' or 'major.minor'
 * @returns {boolean} - True if versions match according to matchType
 */
function compareVersions(v1, v2, matchType = 'exact') {
  if (!v1 || !v2) return true; // Skip comparison if either is missing

  // Remove any version prefixes (^, ~, >=, etc.)
  const cleanV1 = v1.replace(/^[\^~>=<]+/, '');
  const cleanV2 = v2.replace(/^[\^~>=<]+/, '');

  if (matchType === 'exact') {
    return cleanV1 === cleanV2;
  } else if (matchType === 'major.minor') {
    const [major1, minor1] = cleanV1.split('.');
    const [major2, minor2] = cleanV2.split('.');
    return major1 === major2 && minor1 === minor2;
  }

  return false;
}

/**
 * Format version for display (shows what was matched)
 */
function formatVersion(version, constraint) {
  if (!version) return 'not found';
  if (!constraint) return version;

  const cleanConstraint = constraint.replace(/^[\^~>=<]+/, '');
  if (cleanConstraint !== constraint) {
    return `${version} (from constraint: ${constraint})`;
  }
  return version;
}

/**
 * Validate a single Dockerfile against its package.json
 */
function validateDockerfile(dockerfilePath, rootDir) {
  const packageJsonPath = findNearestPackageJson(dockerfilePath);

  if (!packageJsonPath) {
    console.error(
      `${colors.red}✗${colors.reset} No package.json found for ${dockerfilePath}`
    );
    return { valid: false, errors: 1 };
  }

  const relativeDockerPath = path.relative(rootDir, dockerfilePath);
  const relativePackagePath = path.relative(rootDir, packageJsonPath);

  console.log(
    `\n${colors.blue}Validating:${colors.reset} ${relativeDockerPath}`
  );
  console.log(`${colors.blue}Against:${colors.reset} ${relativePackagePath}`);

  const dockerVersions = parseDockerfile(dockerfilePath);
  const packageVersions = parsePackageJson(packageJsonPath);

  if (!dockerVersions || !packageVersions) {
    return { valid: false, errors: 1 };
  }

  let hasErrors = false;
  let errors = 0;

  // Validate Node.js version (major.minor match)
  if (dockerVersions.node && packageVersions.node) {
    const matches = compareVersions(
      dockerVersions.node,
      packageVersions.node,
      'major.minor'
    );
    if (matches) {
      console.log(
        `  ${colors.green}✓${colors.reset} Node.js: ${
          dockerVersions.node
        } matches ${formatVersion(dockerVersions.node, packageVersions.node)}`
      );
    } else {
      console.error(
        `  ${colors.red}✗${colors.reset} Node.js version mismatch:`
      );
      console.error(`    Dockerfile: ${dockerVersions.node}`);
      console.error(`    package.json: ${packageVersions.node}`);
      hasErrors = true;
      errors++;
    }
  } else if (dockerVersions.node || packageVersions.node) {
    console.warn(
      `  ${colors.yellow}⚠${
        colors.reset
      } Node.js version found in only one file (Docker: ${
        dockerVersions.node || 'none'
      }, package.json: ${packageVersions.node || 'none'})`
    );
  }

  // Validate pnpm version (exact match)
  if (dockerVersions.pnpm && packageVersions.pnpm) {
    const matches = compareVersions(
      dockerVersions.pnpm,
      packageVersions.pnpm,
      'exact'
    );
    if (matches) {
      console.log(
        `  ${colors.green}✓${colors.reset} pnpm: ${dockerVersions.pnpm} matches package.json`
      );
    } else {
      console.error(`  ${colors.red}✗${colors.reset} pnpm version mismatch:`);
      console.error(`    Dockerfile: ${dockerVersions.pnpm}`);
      console.error(`    package.json: ${packageVersions.pnpm}`);
      hasErrors = true;
      errors++;
    }
  } else if (dockerVersions.pnpm || packageVersions.pnpm) {
    console.warn(
      `  ${colors.yellow}⚠${
        colors.reset
      } pnpm version found in only one file (Docker: ${
        dockerVersions.pnpm || 'none'
      }, package.json: ${packageVersions.pnpm || 'none'})`
    );
  }

  // Validate Turbo version (exact match)
  if (dockerVersions.turbo && packageVersions.turbo) {
    const matches = compareVersions(
      dockerVersions.turbo,
      packageVersions.turbo,
      'exact'
    );
    if (matches) {
      console.log(
        `  ${colors.green}✓${colors.reset} Turbo: ${dockerVersions.turbo} matches package.json`
      );
    } else {
      console.error(`  ${colors.red}✗${colors.reset} Turbo version mismatch:`);
      console.error(`    Dockerfile: ${dockerVersions.turbo}`);
      console.error(`    package.json: ${packageVersions.turbo}`);
      hasErrors = true;
      errors++;
    }
  } else if (dockerVersions.turbo || packageVersions.turbo) {
    console.warn(
      `  ${colors.yellow}⚠${
        colors.reset
      } Turbo version found in only one file (Docker: ${
        dockerVersions.turbo || 'none'
      }, package.json: ${packageVersions.turbo || 'none'})`
    );
  }

  return { valid: !hasErrors, errors };
}

/**
 * Main execution
 */
function main() {
  const rootDir = path.resolve(__dirname, '..');

  console.log(`${colors.bold}Docker Version Validator${colors.reset}`);
  console.log(`Checking Dockerfiles in: ${rootDir}\n`);

  const dockerfiles = findDockerfiles(rootDir);

  if (dockerfiles.length === 0) {
    console.log(
      `${colors.yellow}⚠${colors.reset} No Dockerfiles found in repository`
    );
    process.exit(0);
  }

  console.log(`Found ${dockerfiles.length} Dockerfile(s) to validate\n`);

  let totalErrors = 0;
  let totalValidated = 0;

  for (const dockerfilePath of dockerfiles) {
    const result = validateDockerfile(dockerfilePath, rootDir);
    totalValidated++;
    if (!result.valid) {
      totalErrors += result.errors;
    }
  }

  console.log(`\n${colors.bold}Summary:${colors.reset}`);
  console.log(`  Dockerfiles validated: ${totalValidated}`);

  if (totalErrors === 0) {
    console.log(`  ${colors.green}✓ All versions match!${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(
      `  ${colors.red}✗ Found ${totalErrors} version mismatch(es)${colors.reset}\n`
    );
    console.log(`${colors.yellow}To fix:${colors.reset}`);
    console.log(
      `  1. Update the Dockerfile to match package.json versions, or`
    );
    console.log(`  2. Update package.json to match Dockerfile versions\n`);
    console.log(`${colors.blue}Validation rules:${colors.reset}`);
    console.log(
      `  - Node.js: Major.minor must match (patch differences allowed)`
    );
    console.log(`  - pnpm: Exact version match required`);
    console.log(`  - Turbo: Exact version match required\n`);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

// Export for testing
module.exports = {
  findDockerfiles,
  findNearestPackageJson,
  parsePackageJson,
  parseDockerfile,
  compareVersions,
  validateDockerfile,
};
