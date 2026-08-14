import { describe, expect, it } from 'vitest';

import {
  expectedEnginesRange,
  extractPackageManagerVersion,
  validatePnpmConfig,
} from './validate-pnpm-config.js';

describe('extractPackageManagerVersion', () => {
  it('extracts the version from a pnpm packageManager string with a hash', () => {
    expect(extractPackageManagerVersion('pnpm@11.21.0+sha512.521705bc')).toBe(
      '11.21.0'
    );
  });

  it('extracts the version from a bare pnpm packageManager string', () => {
    expect(extractPackageManagerVersion('pnpm@10.20.0')).toBe('10.20.0');
  });

  it('returns null for a non-pnpm package manager', () => {
    expect(extractPackageManagerVersion('yarn@4.5.0')).toBe(null);
  });

  it('returns null for a missing value', () => {
    expect(extractPackageManagerVersion(undefined as unknown as string)).toBe(
      null
    );
  });
});

describe('expectedEnginesRange', () => {
  it('builds a floor-and-next-major range from the pinned version', () => {
    expect(expectedEnginesRange('11.21.0')).toBe('>=11.21.0 <12');
  });

  it('follows the pinned major', () => {
    expect(expectedEnginesRange('12.0.1')).toBe('>=12.0.1 <13');
  });
});

describe('validatePnpmConfig', () => {
  const validPkg = {
    packageManager: 'pnpm@11.21.0+sha512.521705bc',
    engines: { node: '^22.23.2', pnpm: '>=11.21.0 <12' },
  };

  it('accepts a package.json whose engines.pnpm matches packageManager', () => {
    const result = validatePnpmConfig(validPkg);
    expect(result.ok).toBe(true);
    expect(result.failures).toEqual([]);
  });

  it('rejects an unbounded engines.pnpm range', () => {
    const result = validatePnpmConfig({
      ...validPkg,
      engines: { pnpm: '>=11.21.0' },
    });
    expect(result.ok).toBe(false);
    expect(result.failures[0]).toContain('">=11.21.0 <12"');
  });

  it('rejects an engines.pnpm floor that drifted below packageManager', () => {
    const result = validatePnpmConfig({
      ...validPkg,
      engines: { pnpm: '>=11.20.0 <12' },
    });
    expect(result.ok).toBe(false);
  });

  it('rejects a missing engines.pnpm', () => {
    const result = validatePnpmConfig({
      packageManager: validPkg.packageManager,
      engines: { node: '^22.23.2' },
    });
    expect(result.ok).toBe(false);
    expect(result.failures[0]).toContain('no engines.pnpm');
  });

  it('rejects a missing or non-pnpm packageManager', () => {
    expect(validatePnpmConfig({}).ok).toBe(false);
    expect(validatePnpmConfig({ packageManager: 'yarn@4.5.0' }).ok).toBe(false);
  });

  it('rejects a pnpm field shadowing pnpm-workspace.yaml', () => {
    const result = validatePnpmConfig({
      ...validPkg,
      pnpm: { overrides: { lodash: '^4.17.21' } },
    });
    expect(result.ok).toBe(false);
    expect(result.failures[0]).toContain('pnpm.overrides');
  });

  it('rejects even an empty pnpm field', () => {
    const result = validatePnpmConfig({ ...validPkg, pnpm: {} });
    expect(result.ok).toBe(false);
  });
});
