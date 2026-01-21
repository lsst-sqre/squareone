/**
 * Tests for error handling utilities.
 */
import { describe, expect, it } from 'vitest';

import {
  formatValidationError,
  GafaelfawrError,
  getErrorMessageForStatus,
} from './errors';

describe('GafaelfawrError', () => {
  it('creates error with message only', () => {
    const error = new GafaelfawrError('Something went wrong');
    expect(error.message).toBe('Something went wrong');
    expect(error.name).toBe('GafaelfawrError');
    expect(error.statusCode).toBeUndefined();
    expect(error.details).toBeUndefined();
  });

  it('creates error with status code', () => {
    const error = new GafaelfawrError('Not found', 404);
    expect(error.message).toBe('Not found');
    expect(error.statusCode).toBe(404);
  });

  it('creates error with details', () => {
    const details = { field: 'username', reason: 'invalid' };
    const error = new GafaelfawrError('Validation error', 422, details);
    expect(error.details).toEqual(details);
  });

  it('is instanceof Error', () => {
    const error = new GafaelfawrError('test');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(GafaelfawrError);
  });
});

describe('formatValidationError', () => {
  it('returns string detail as-is', () => {
    expect(formatValidationError('Simple error')).toBe('Simple error');
  });

  it('formats single validation error', () => {
    const result = formatValidationError({
      loc: ['body', 'token_name'],
      msg: 'field required',
      type: 'value_error.missing',
    });
    expect(result).toBe('body.token_name: field required');
  });

  it('handles missing location', () => {
    const result = formatValidationError({
      msg: 'invalid value',
      type: 'value_error',
    });
    expect(result).toBe('unknown: invalid value');
  });

  it('formats array of validation errors', () => {
    const result = formatValidationError([
      { loc: ['body', 'field1'], msg: 'required', type: 'missing' },
      { loc: ['body', 'field2'], msg: 'invalid', type: 'type_error' },
    ]);
    expect(result).toBe('body.field1: required; body.field2: invalid');
  });

  it('handles empty array', () => {
    const result = formatValidationError([]);
    expect(result).toBe('');
  });

  it('handles null location in array', () => {
    const result = formatValidationError([
      { loc: null, msg: 'error 1', type: 'error' },
      { msg: 'error 2', type: 'error' },
    ]);
    expect(result).toBe('unknown: error 1; unknown: error 2');
  });
});

describe('getErrorMessageForStatus', () => {
  it('returns message for 401', () => {
    expect(getErrorMessageForStatus(401)).toContain('Authentication required');
  });

  it('returns message for 403', () => {
    expect(getErrorMessageForStatus(403)).toContain('permission');
  });

  it('returns message for 404', () => {
    expect(getErrorMessageForStatus(404)).toContain('not found');
  });

  it('returns message for 422', () => {
    expect(getErrorMessageForStatus(422)).toContain('Invalid');
  });

  it('returns message for 500', () => {
    expect(getErrorMessageForStatus(500)).toContain('Server error');
  });

  it('returns default message for unknown status', () => {
    expect(getErrorMessageForStatus(418)).toBe('An error occurred');
    expect(getErrorMessageForStatus(418, 'Custom message')).toBe(
      'Custom message'
    );
  });
});
