#!/usr/bin/env node

/**
 * Checks that the production build ships the syntax-highlighting rules for the
 * squared CodeBlock component.
 *
 * @lsst-sqre/global-css/dist/syntax.css carries MicroLighter's GitHub theme,
 * whose global ::highlight() rules colour CodeBlock's tokens. Next.js's
 * Turbopack bundles an older Lightning CSS that can't parse ::highlight(), so
 * `next build` logs a "Parsing CSS source code failed" warning for that
 * stylesheet and keeps the rules only through its error recovery. If that
 * recovery ever drops them, the build still succeeds and code ships uncoloured.
 * This check runs after `next build` and fails the build when no emitted
 * stylesheet under .next/static carries a ::highlight( rule.
 *
 * Usage: node scripts/check-syntax-css.js [staticDir]
 *   staticDir defaults to this app's .next/static directory.
 *
 * Exit codes:
 * - 0: At least one emitted stylesheet carries a ::highlight( rule
 * - 1: No emitted stylesheet carries a ::highlight( rule
 * - 2: Validation error (the build output directory is missing)
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

/** The selector prefix every syntax-highlighting rule starts with. */
const HIGHLIGHT_RULE = '::highlight(';

/**
 * List the CSS files under a directory, recursively.
 * @param {string} dir - Directory to scan.
 * @returns {string[]} - Absolute paths of the .css files, sorted.
 */
function listCssFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listCssFiles(entryPath));
    } else if (entry.isFile() && entry.name.endsWith('.css')) {
      files.push(entryPath);
    }
  }
  return files.sort();
}

/**
 * Find the emitted stylesheets that carry a ::highlight( rule.
 * @param {string} staticDir - The build's static output directory.
 * @returns {string[]} - Paths of the CSS files containing a ::highlight( rule.
 */
function findHighlightCss(staticDir) {
  return listCssFiles(staticDir).filter((filePath) =>
    fs.readFileSync(filePath, 'utf8').includes(HIGHLIGHT_RULE)
  );
}

/**
 * Print the remediation hint for a build without ::highlight( rules.
 */
function printFixHint() {
  console.error(`\n${colors.yellow}To fix, check that:${colors.reset}`);
  console.error(
    "  1. src/app/layout.tsx imports '@lsst-sqre/global-css/dist/syntax.css'."
  );
  console.error(
    '  2. @lsst-sqre/global-css built dist/syntax.css with the MicroLighter theme.'
  );
  console.error(
    `  3. Next.js still keeps the ${HIGHLIGHT_RULE}) rules: a "Parsing CSS source code failed"`
  );
  console.error(
    '     warning for syntax.css in the build log shows where its CSS parser stopped.'
  );
  console.error('');
}

/**
 * Main execution
 * @param {string[]} argv - Command-line arguments after the script path.
 */
function main(argv) {
  const staticDir = path.resolve(
    argv[0] || path.join(__dirname, '..', '.next', 'static')
  );
  const displayDir = path.relative(process.cwd(), staticDir) || '.';

  console.log(`${colors.bold}Syntax Highlighting CSS Check${colors.reset}`);
  console.log(`\n${colors.blue}Scanning:${colors.reset} ${displayDir}`);

  if (!fs.existsSync(staticDir)) {
    console.error(
      `  ${colors.red}✗${colors.reset} Build output directory not found: ${displayDir}`
    );
    console.error('    Run `next build` before this check.');
    process.exit(2);
  }

  const matches = findHighlightCss(staticDir);
  if (matches.length > 0) {
    for (const filePath of matches) {
      console.log(
        `  ${colors.green}✓${colors.reset} ${path.relative(staticDir, filePath)} carries ${HIGHLIGHT_RULE}) rules`
      );
    }
    console.log(
      `\n${colors.bold}Summary:${colors.reset} ${colors.green}✓ Syntax highlighting CSS is in the build${colors.reset}\n`
    );
    process.exit(0);
  }

  console.error(
    `  ${colors.red}✗${colors.reset} No stylesheet in ${displayDir} contains a ${HIGHLIGHT_RULE}) rule.`
  );
  console.error(
    '    CodeBlock syntax highlighting would ship uncoloured: the rules come from'
  );
  console.error(
    "    MicroLighter's GitHub theme in @lsst-sqre/global-css/dist/syntax.css."
  );
  printFixHint();
  process.exit(1);
}

// Run if executed directly
if (require.main === module) {
  main(process.argv.slice(2));
}

// Export for testing
module.exports = {
  HIGHLIGHT_RULE,
  findHighlightCss,
  listCssFiles,
};
