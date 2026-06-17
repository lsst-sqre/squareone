import { describe, expect, it } from 'vitest';

import { compareVersions } from './validate-docker-versions.js';

describe('compareVersions', () => {
  describe('exact match', () => {
    it('matches identical versions', () => {
      expect(compareVersions('10.20.0', '10.20.0', 'exact')).toBe(true);
    });

    it('rejects a differing patch version', () => {
      expect(compareVersions('10.20.0', '10.20.1', 'exact')).toBe(false);
    });

    it('strips a range prefix before comparing', () => {
      // package.json constraints like "^2.5.6" must compare equal to the
      // exact version pinned in a Dockerfile.
      expect(compareVersions('2.5.6', '^2.5.6', 'exact')).toBe(true);
      expect(compareVersions('2.5.6', '~2.5.6', 'exact')).toBe(true);
    });
  });

  describe('major.minor match', () => {
    it('matches when only the patch differs', () => {
      // Node.js is validated on major.minor; patch drift is allowed.
      expect(compareVersions('22.14.0', '22.14.3', 'major.minor')).toBe(true);
    });

    it('rejects a differing minor version', () => {
      expect(compareVersions('22.14.0', '22.15.0', 'major.minor')).toBe(false);
    });

    it('rejects a differing major version', () => {
      expect(compareVersions('22.14.0', '23.14.0', 'major.minor')).toBe(false);
    });
  });

  describe('missing operands', () => {
    it('treats a missing version as a skipped (passing) comparison', () => {
      // A version present in only one file is surfaced as a warning elsewhere;
      // the comparison itself short-circuits to true rather than failing.
      expect(compareVersions(null, '10.20.0', 'exact')).toBe(true);
      expect(compareVersions('10.20.0', null, 'exact')).toBe(true);
    });
  });
});
