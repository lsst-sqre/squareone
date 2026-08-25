/**
 * Tests for error handling utilities.
 */
import { describe, expect, it } from 'vitest';

import {
  formatValidationError,
  GafaelfawrError,
  getErrorMessageForStatus,
  isOidcNotConfiguredError,
  OidcNotConfiguredError,
  toGafaelfawrErrorInfo,
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

  it('returns the bare message when there is no location', () => {
    // Gafaelfawr's ErrorModel omits (or nulls) `loc` for whole-request errors
    // such as a 403, where a "unknown: " prefix would be noise in the UI.
    const result = formatValidationError({
      msg: 'invalid value',
      type: 'value_error',
    });
    expect(result).toBe('invalid value');
  });

  it('returns the bare message when the location is empty', () => {
    const result = formatValidationError({
      loc: [],
      msg: 'invalid value',
      type: 'value_error',
    });
    expect(result).toBe('invalid value');
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
    expect(result).toBe('error 1; error 2');
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

describe('OidcNotConfiguredError', () => {
  it('is a GafaelfawrError carrying a 404 status', () => {
    const error = new OidcNotConfiguredError();
    expect(error).toBeInstanceOf(GafaelfawrError);
    expect(error.statusCode).toBe(404);
    expect(error.name).toBe('OidcNotConfiguredError');
  });

  it('has a default message naming the missing OpenID Connect server', () => {
    expect(new OidcNotConfiguredError().message).toMatch(/OpenID Connect/i);
  });

  it('accepts a server-supplied message', () => {
    const error = new OidcNotConfiguredError('Not configured here');
    expect(error.message).toBe('Not configured here');
  });
});

describe('isOidcNotConfiguredError', () => {
  it('identifies the not-configured error', () => {
    expect(isOidcNotConfiguredError(new OidcNotConfiguredError())).toBe(true);
  });

  it('rejects a plain 404 GafaelfawrError', () => {
    // A 404 from a *detail* endpoint means "no such client", which the UI must
    // present differently from "this environment has no OIDC server".
    expect(
      isOidcNotConfiguredError(new GafaelfawrError('Not found', 404))
    ).toBe(false);
  });

  it('rejects non-errors', () => {
    expect(isOidcNotConfiguredError(null)).toBe(false);
    expect(isOidcNotConfiguredError('nope')).toBe(false);
  });
});

describe('toGafaelfawrErrorInfo', () => {
  it('preserves the status and message of a GafaelfawrError', () => {
    const info = toGafaelfawrErrorInfo(
      new GafaelfawrError('Permission denied', 403, { detail: 'nope' })
    );
    expect(info).toEqual({
      status: 403,
      message: 'Permission denied',
      details: { detail: 'nope' },
    });
  });

  it('defaults a status-less GafaelfawrError to 500', () => {
    expect(toGafaelfawrErrorInfo(new GafaelfawrError('Boom')).status).toBe(500);
  });

  it('reports a non-Gafaelfawr error as a status-0 network failure', () => {
    const info = toGafaelfawrErrorInfo(new TypeError('Failed to fetch'));
    expect(info.status).toBe(0);
    expect(info.message).toBe('Failed to fetch');
  });

  it('reports a thrown non-Error as a generic network failure', () => {
    expect(toGafaelfawrErrorInfo('boom')).toEqual({
      status: 0,
      message: 'Network error',
    });
  });
});
