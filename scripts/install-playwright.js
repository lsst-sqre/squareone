#!/usr/bin/env node

/**
 * Conditionally install Playwright browsers for local development.
 *
 * This script runs automatically after `pnpm install` via the prepare hook.
 * It skips installation in CI/Docker environments where browsers are:
 * - Pre-installed in Docker containers (GitHub Actions)
 * - Not needed (Docker production builds)
 *
 * Environment variables checked (in priority order):
 * 1. PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 - Explicit skip signal
 * 2. PLAYWRIGHT_BROWSERS_PATH - Browsers available at custom path
 * 3. CI - Running in CI/Docker environment
 */

// Check if we should skip installation
if (
  process.env.PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD === '1' ||
  process.env.PLAYWRIGHT_BROWSERS_PATH ||
  process.env.CI
) {
  console.log(
    '⏭️  Skipping Playwright browser installation (CI/prebuilt environment detected)'
  );
  process.exit(0);
}

console.log('📥 Installing Playwright browsers for local development...');
console.log(
  '   This may take a few minutes on first install or after Playwright updates.'
);

const { spawn } = require('node:child_process');

// Install only chromium (the browser we actually use in tests)
const proc = spawn(
  'pnpm',
  ['exec', 'playwright', 'install', 'chromium', '--with-deps'],
  {
    stdio: 'inherit',
    shell: true,
  }
);

proc.on('error', (error) => {
  console.error('❌ Failed to start Playwright installation:', error.message);
  console.error(
    '   You may need to run manually: pnpm exec playwright install chromium'
  );
  process.exit(1);
});

proc.on('exit', (code) => {
  if (code === 0) {
    console.log('✅ Playwright browsers installed successfully');
  } else {
    console.error('❌ Failed to install Playwright browsers');
    console.error(
      '   Run manually to see details: pnpm exec playwright install chromium'
    );
  }
  process.exit(code || 0);
});
