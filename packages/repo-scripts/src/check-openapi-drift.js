#!/usr/bin/env node

/**
 * Checks whether any vendored OpenAPI client spec has drifted from its live
 * source.
 *
 * For each Rubin Science Platform client package that defines a `fetch-openapi`
 * script, the live spec URL is derived from that script (the single source of
 * truth — the URLs are not duplicated here), the live spec is fetched, and it is
 * compared against the committed `packages/<client>/openapi.json`. Both specs are
 * normalized first (parsed, then re-serialized with recursively sorted object
 * keys) so differences in key order or whitespace don't produce false positives.
 *
 * The comparison excludes `info.version`: an RSP service redeploy commonly bumps
 * its spec's `info.version` (e.g. a setuptools-scm dev version) with no change to
 * the API surface. Such a version-only difference is reported for visibility but
 * does not fail the run, so re-vendoring is only prompted on a real API change.
 *
 * Per-client outcomes:
 * - ok:           committed spec matches live (after normalization)
 * - version-only: only `info.version` differs (server redeploy, no API change) ->
 *                 reported but not a failure; no re-vendoring needed
 * - drift:        committed spec differs from live beyond `info.version` ->
 *                 needs re-vendoring
 * - fetch-error:  a vendored spec exists but its live source could not be fetched
 *                 (can't verify it isn't stale, so this is treated as a failure)
 * - skipped:      no committed openapi.json is vendored for the client
 * - config-error: the package.json could not be read or has no fetch-openapi URL
 *
 * Exit codes:
 * - 0: every checked spec is in sync, including version-only differences
 *      (skipped clients don't fail the run)
 * - 1: at least one spec drifted or its live source could not be fetched
 * - 2: a configuration/validation error prevented the check
 *
 * Runs weekly in GitHub Actions (open egress) via .github/workflows/periodic-ci.yaml,
 * and is runnable locally / in the sandbox via `pnpm run check-openapi-drift`.
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

// Client packages whose vendored OpenAPI specs we guard against drift.
const CLIENT_PACKAGES = [
  'gafaelfawr-client',
  'semaphore-client',
  'repertoire-client',
  'times-square-client',
];

// Abandon a live-spec fetch that takes longer than this (ms) so the job can't
// hang on an unresponsive host.
const FETCH_TIMEOUT_MS = 30000;

// Repo root, resolved from this script's home in packages/repo-scripts/src.
const rootDir = path.resolve(__dirname, '../../..');

/**
 * Extract the live spec URL from a package's `fetch-openapi` script.
 *
 * The script is a curl invocation such as
 *   curl -o openapi.json https://data.lsst.cloud/auth/openapi.json
 * We pull the first http(s) URL out of it, so the URL is sourced from the
 * package's own script rather than duplicated in this file.
 */
function extractSpecUrl(fetchScript) {
  if (!fetchScript) return null;
  const match = fetchScript.match(/https?:\/\/\S+/);
  return match ? match[0] : null;
}

/**
 * Recursively sort object keys to produce a canonical representation. Array
 * order is preserved (it is semantically significant in OpenAPI); only object
 * keys are reordered so that key-order / whitespace differences compare equal.
 */
function canonicalize(value) {
  if (Array.isArray(value)) {
    return value.map(canonicalize);
  }
  if (value && typeof value === 'object') {
    const sorted = {};
    for (const key of Object.keys(value).sort()) {
      sorted[key] = canonicalize(value[key]);
    }
    return sorted;
  }
  return value;
}

/**
 * Canonical JSON serialization used for drift comparison.
 */
function canonicalJson(spec) {
  return JSON.stringify(canonicalize(spec));
}

/**
 * Canonical JSON serialization with `info.version` excluded, used for the
 * drift comparison. A server redeploy that only bumps `info.version` should
 * not register as drift, so the version is removed before comparison. The spec
 * is deep-cloned first (specs are pure JSON) so the original object — still
 * needed for its version by `specVersion` — is not mutated.
 */
function comparableJson(spec) {
  const clone = JSON.parse(JSON.stringify(spec));
  if (clone?.info && 'version' in clone.info) {
    delete clone.info.version;
  }
  return canonicalJson(clone);
}

/**
 * Read the `info.version` from a parsed spec, falling back to a placeholder.
 */
function specVersion(spec) {
  return spec?.info?.version ?? 'unknown';
}

/**
 * Classify a committed spec against its live source, ignoring `info.version`.
 * Returns one of:
 * - 'ok':           specs are identical, version included
 * - 'version-only': specs match apart from `info.version` (server redeploy)
 * - 'drift':        specs differ beyond `info.version`
 */
function classifySpecs(committed, live) {
  if (comparableJson(committed) === comparableJson(live)) {
    return specVersion(committed) === specVersion(live) ? 'ok' : 'version-only';
  }
  return 'drift';
}

/**
 * Fetch a live OpenAPI spec and parse it as JSON.
 * Returns { ok: true, spec } or { ok: false, error }.
 */
async function fetchLiveSpec(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      return {
        ok: false,
        error: `HTTP ${response.status} ${response.statusText}`,
      };
    }
    const text = await response.text();
    try {
      return { ok: true, spec: JSON.parse(text) };
    } catch (error) {
      return {
        ok: false,
        error: `live response is not valid JSON: ${error.message}`,
      };
    }
  } catch (error) {
    const reason =
      error.name === 'AbortError'
        ? `request timed out after ${FETCH_TIMEOUT_MS}ms`
        : error.message;
    return { ok: false, error: reason };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Check a single client package's vendored spec against its live source.
 */
async function checkClient(clientPkg) {
  const pkgDir = path.join(rootDir, 'packages', clientPkg);
  const pkgJsonPath = path.join(pkgDir, 'package.json');
  const specPath = path.join(pkgDir, 'openapi.json');

  let pkg;
  try {
    pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
  } catch (error) {
    return {
      client: clientPkg,
      status: 'config-error',
      detail: `cannot read ${path.relative(rootDir, pkgJsonPath)}: ${error.message}`,
    };
  }

  const url = extractSpecUrl(pkg.scripts?.['fetch-openapi']);
  if (!url) {
    return {
      client: clientPkg,
      status: 'config-error',
      detail: 'no fetch-openapi script URL found in package.json',
    };
  }

  const hasLocal = fs.existsSync(specPath);

  // Always fetch the live spec so the check exercises every client's host.
  const live = await fetchLiveSpec(url);

  if (!live.ok) {
    // With nothing vendored, a live hiccup isn't actionable drift -> skip.
    if (!hasLocal) {
      return {
        client: clientPkg,
        status: 'skipped',
        url,
        detail: `no committed openapi.json (live fetch also failed: ${live.error})`,
      };
    }
    return {
      client: clientPkg,
      status: 'fetch-error',
      url,
      detail: live.error,
    };
  }

  if (!hasLocal) {
    return {
      client: clientPkg,
      status: 'skipped',
      url,
      detail: 'no committed openapi.json to compare against',
    };
  }

  let committed;
  try {
    committed = JSON.parse(fs.readFileSync(specPath, 'utf8'));
  } catch (error) {
    return {
      client: clientPkg,
      status: 'config-error',
      detail: `cannot parse ${path.relative(rootDir, specPath)}: ${error.message}`,
    };
  }

  const committedVersion = specVersion(committed);
  const liveVersion = specVersion(live.spec);

  return {
    client: clientPkg,
    status: classifySpecs(committed, live.spec),
    url,
    committedVersion,
    liveVersion,
  };
}

/**
 * Print the per-client result line(s).
 */
function printResult(result) {
  switch (result.status) {
    case 'ok':
      console.log(
        `  ${colors.green}✓${colors.reset} in sync (info.version ${result.committedVersion})`
      );
      break;
    case 'version-only':
      console.log(
        `  ${colors.green}✓${colors.reset} in sync (info.version ${result.committedVersion} -> ${result.liveVersion}; server redeploy, no API change — not re-vendored)`
      );
      break;
    case 'drift': {
      const versionNote =
        result.committedVersion === result.liveVersion
          ? `info.version ${result.committedVersion} unchanged; spec content differs`
          : `info.version ${result.committedVersion} -> ${result.liveVersion}`;
      console.error(
        `  ${colors.red}✗${colors.reset} DRIFT: vendored spec differs from live`
      );
      console.error(`    ${versionNote}`);
      console.error(`    live source: ${result.url}`);
      break;
    }
    case 'fetch-error':
      console.error(
        `  ${colors.red}✗${colors.reset} could not fetch live spec: ${result.detail}`
      );
      console.error(`    live source: ${result.url}`);
      break;
    case 'skipped':
      console.warn(
        `  ${colors.yellow}⚠${colors.reset} skipped: ${result.detail}`
      );
      break;
    case 'config-error':
      console.error(
        `  ${colors.red}✗${colors.reset} config error: ${result.detail}`
      );
      break;
    default:
      console.error(`  ${colors.red}✗${colors.reset} unknown status`);
  }
}

/**
 * List the client names for a given status, for the summary.
 */
function namesWithStatus(results, status) {
  return results
    .filter((r) => r.status === status)
    .map((r) => r.client)
    .join(', ');
}

/**
 * Main execution. Returns the process exit code.
 */
async function main() {
  console.log(`${colors.bold}OpenAPI Drift Check${colors.reset}`);
  console.log('Comparing vendored client specs against their live sources\n');

  const results = [];
  for (const clientPkg of CLIENT_PACKAGES) {
    console.log(`${colors.blue}Checking:${colors.reset} ${clientPkg}`);
    const result = await checkClient(clientPkg);
    printResult(result);
    results.push(result);
    console.log('');
  }

  const ok = results.filter((r) => r.status === 'ok');
  const versionOnly = results.filter((r) => r.status === 'version-only');
  const drifted = results.filter((r) => r.status === 'drift');
  const fetchErrors = results.filter((r) => r.status === 'fetch-error');
  const skipped = results.filter((r) => r.status === 'skipped');
  const configErrors = results.filter((r) => r.status === 'config-error');

  console.log(`${colors.bold}Summary:${colors.reset}`);
  console.log(`  Clients checked: ${results.length}`);
  console.log(
    `  ${colors.green}✓${colors.reset} In sync: ${ok.length}${
      ok.length ? ` (${namesWithStatus(results, 'ok')})` : ''
    }`
  );
  if (versionOnly.length) {
    console.log(
      `  ${colors.green}✓${colors.reset} Version-only (no API change): ${versionOnly.length} (${namesWithStatus(results, 'version-only')})`
    );
  }
  if (drifted.length) {
    console.log(
      `  ${colors.red}✗${colors.reset} Drifted: ${drifted.length} (${namesWithStatus(results, 'drift')})`
    );
  }
  if (fetchErrors.length) {
    console.log(
      `  ${colors.red}✗${colors.reset} Fetch errors: ${fetchErrors.length} (${namesWithStatus(results, 'fetch-error')})`
    );
  }
  if (skipped.length) {
    console.log(
      `  ${colors.yellow}⚠${colors.reset} Skipped (no vendored spec): ${skipped.length} (${namesWithStatus(results, 'skipped')})`
    );
  }
  if (configErrors.length) {
    console.log(
      `  ${colors.red}✗${colors.reset} Config errors: ${configErrors.length} (${namesWithStatus(results, 'config-error')})`
    );
  }

  if (drifted.length || fetchErrors.length) {
    console.log(`\n${colors.yellow}To fix drift:${colors.reset}`);
    console.log(
      '  Re-vendor the spec and commit the result, e.g. for a drifted client:'
    );
    console.log('    pnpm --filter @lsst-sqre/<client> fetch-openapi');
    console.log(
      '  then review and commit the updated packages/<client>/openapi.json.\n'
    );
  } else {
    console.log(
      `\n${colors.green}✓ All vendored specs are in sync.${colors.reset}\n`
    );
  }

  if (configErrors.length) return 2;
  if (drifted.length || fetchErrors.length) return 1;
  return 0;
}

// Run if executed directly
if (require.main === module) {
  main()
    .then((code) => process.exit(code))
    .catch((error) => {
      console.error(
        `${colors.red}✗${colors.reset} Unexpected error: ${error.stack || error}`
      );
      process.exit(2);
    });
}

// Export for testing
module.exports = {
  extractSpecUrl,
  canonicalize,
  canonicalJson,
  comparableJson,
  classifySpecs,
  specVersion,
  fetchLiveSpec,
  checkClient,
};
