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
 * 1. STOKER_SANDBOX / STOKER_REPO_NAME - Running inside the stoker sandbox
 * 2. PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 - Explicit skip signal
 * 3. PLAYWRIGHT_BROWSERS_PATH - Browsers available at custom path
 * 4. CI - Running in CI/Docker environment
 */

// In the stoker sandbox the egress firewall is already up during this
// `pnpm install` (it runs in postCreate), but the cdn.playwright.dev
// allowlist entry isn't live yet — firewall extras only propagate after the
// container finishes coming up. Auto-downloading here would fail and abort
// the whole postCreate, so skip it. The CDN is allowlisted in
// .stoker/settings.toml ([sandbox.firewall_extra_domains]), so browsers can
// be installed on demand once the sandbox is up. STOKER_REPO_NAME is part of
// the derived devcontainer's containerEnv, so it's reliably set in-sandbox.
if (process.env.STOKER_SANDBOX || process.env.STOKER_REPO_NAME) {
  console.log(
    '⏭️  Skipping Playwright browser installation (stoker sandbox detected)'
  );
  console.log(
    '   Install on demand with: pnpm exec playwright install chromium'
  );
  process.exit(0);
}

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
