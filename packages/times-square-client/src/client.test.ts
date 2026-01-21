/**
 * Tests for Times Square API client functions.
 */
import { describe, expect, it } from 'vitest';

import { sanitizeDisplayPath } from './client';
import { TimesSquareError } from './errors';

describe('sanitizeDisplayPath', () => {
  describe('valid paths', () => {
    it('passes through simple paths unchanged', () => {
      expect(sanitizeDisplayPath('owner/repo/notebook')).toBe(
        'owner/repo/notebook'
      );
    });

    it('passes through single-segment paths', () => {
      expect(sanitizeDisplayPath('notebook')).toBe('notebook');
    });

    it('passes through deeply nested paths', () => {
      expect(sanitizeDisplayPath('owner/repo/dir/subdir/notebook')).toBe(
        'owner/repo/dir/subdir/notebook'
      );
    });

    it('encodes spaces in path segments', () => {
      expect(sanitizeDisplayPath('owner/repo/my notebook')).toBe(
        'owner/repo/my%20notebook'
      );
    });

    it('encodes special characters in path segments', () => {
      expect(sanitizeDisplayPath('owner/repo/test@file')).toBe(
        'owner/repo/test%40file'
      );
      expect(sanitizeDisplayPath('owner/repo/file#1')).toBe(
        'owner/repo/file%231'
      );
      expect(sanitizeDisplayPath('owner/repo/a?b')).toBe('owner/repo/a%3Fb');
    });

    it('handles leading slashes by filtering empty segments', () => {
      expect(sanitizeDisplayPath('/owner/repo')).toBe('owner/repo');
    });

    it('handles trailing slashes by filtering empty segments', () => {
      expect(sanitizeDisplayPath('owner/repo/')).toBe('owner/repo');
    });

    it('handles double slashes by filtering empty segments', () => {
      expect(sanitizeDisplayPath('owner//repo')).toBe('owner/repo');
    });

    it('handles path with only leading and trailing slashes', () => {
      expect(sanitizeDisplayPath('/owner/repo/')).toBe('owner/repo');
    });
  });

  describe('path traversal prevention', () => {
    it('rejects paths starting with ..', () => {
      expect(() => sanitizeDisplayPath('../etc/passwd')).toThrow(
        TimesSquareError
      );
      expect(() => sanitizeDisplayPath('../etc/passwd')).toThrow(
        'path traversal'
      );
    });

    it('rejects paths with .. in the middle', () => {
      expect(() => sanitizeDisplayPath('owner/../other')).toThrow(
        TimesSquareError
      );
      expect(() => sanitizeDisplayPath('owner/repo/../../../etc')).toThrow(
        TimesSquareError
      );
    });

    it('rejects paths ending with ..', () => {
      expect(() => sanitizeDisplayPath('owner/repo/..')).toThrow(
        TimesSquareError
      );
    });

    it('rejects paths starting with .', () => {
      expect(() => sanitizeDisplayPath('./config')).toThrow(TimesSquareError);
    });

    it('rejects paths with . in the middle', () => {
      expect(() => sanitizeDisplayPath('owner/./repo')).toThrow(
        TimesSquareError
      );
    });

    it('rejects standalone ..', () => {
      expect(() => sanitizeDisplayPath('..')).toThrow(TimesSquareError);
    });

    it('rejects standalone .', () => {
      expect(() => sanitizeDisplayPath('.')).toThrow(TimesSquareError);
    });

    it('allows segments that contain but are not equal to ..', () => {
      // "foo.." and "..bar" are valid segment names, not traversal
      expect(sanitizeDisplayPath('owner/repo/file..ext')).toBe(
        'owner/repo/file..ext'
      );
      expect(sanitizeDisplayPath('owner/repo/..hidden')).toBe(
        'owner/repo/..hidden'
      );
    });

    it('allows segments that contain but are not equal to .', () => {
      // ".hidden" is a valid filename, not traversal
      expect(sanitizeDisplayPath('owner/repo/.hidden')).toBe(
        'owner/repo/.hidden'
      );
      expect(sanitizeDisplayPath('owner/repo/file.txt')).toBe(
        'owner/repo/file.txt'
      );
    });
  });

  describe('empty path handling', () => {
    it('rejects empty string', () => {
      expect(() => sanitizeDisplayPath('')).toThrow(TimesSquareError);
      expect(() => sanitizeDisplayPath('')).toThrow('cannot be empty');
    });

    it('rejects whitespace-only string', () => {
      expect(() => sanitizeDisplayPath('   ')).toThrow(TimesSquareError);
      expect(() => sanitizeDisplayPath('\t')).toThrow(TimesSquareError);
    });

    it('rejects path that is only slashes', () => {
      expect(() => sanitizeDisplayPath('/')).toThrow(TimesSquareError);
      expect(() => sanitizeDisplayPath('//')).toThrow(TimesSquareError);
      expect(() => sanitizeDisplayPath('///')).toThrow(TimesSquareError);
    });
  });

  describe('error status codes', () => {
    it('throws errors with 400 status code', () => {
      try {
        sanitizeDisplayPath('../evil');
      } catch (error) {
        expect(error).toBeInstanceOf(TimesSquareError);
        expect((error as TimesSquareError).statusCode).toBe(400);
      }
    });
  });

  describe('real-world attack vectors', () => {
    it('blocks SSRF attempts via path traversal', () => {
      // Attack: navigate up to hit internal services
      expect(() =>
        sanitizeDisplayPath('owner/../../../internal-service')
      ).toThrow(TimesSquareError);
    });

    it('blocks attempts to access system files', () => {
      expect(() => sanitizeDisplayPath('../../etc/passwd')).toThrow(
        TimesSquareError
      );
    });

    it('blocks multiple traversal sequences', () => {
      expect(() =>
        sanitizeDisplayPath('a/../b/../c/../../../etc/shadow')
      ).toThrow(TimesSquareError);
    });
  });
});
