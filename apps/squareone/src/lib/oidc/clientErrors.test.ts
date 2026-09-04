import {
  GafaelfawrError,
  OidcNotConfiguredError,
} from '@lsst-sqre/gafaelfawr-client';
import { describe, expect, test } from 'vitest';

import { describeOidcClientFailure, OIDC_API_SCOPE } from './clientErrors';

const NOT_FOUND = 'This client no longer exists.';

describe('describeOidcClientFailure', () => {
  test("passes Gafaelfawr's own 422 detail through verbatim", () => {
    // A 422 names the offending field far better than this app could, and it
    // is the failure an operator can actually act on.
    const message = describeOidcClientFailure(
      new GafaelfawrError('body.return_uri: URL scheme not permitted', 422),
      { notFound: NOT_FOUND }
    );

    expect(message).toBe('body.return_uri: URL scheme not permitted');
  });

  test('names the API scope on a 403', () => {
    // Gafaelfawr's 403 body says only "Permission denied".
    const message = describeOidcClientFailure(
      new GafaelfawrError('Permission denied', 403),
      { notFound: NOT_FOUND }
    );

    expect(message).toContain(OIDC_API_SCOPE);
    expect(message).not.toBe('Permission denied');
  });

  test("uses the caller's sentence on a 404", () => {
    // 404 means different things on the collection and per-client routes, so
    // the caller supplies the copy.
    const message = describeOidcClientFailure(new OidcNotConfiguredError(), {
      notFound: NOT_FOUND,
    });

    expect(message).toBe(NOT_FOUND);
  });

  test('reports a network failure with its own message', () => {
    const message = describeOidcClientFailure(
      new TypeError('Failed to fetch'),
      {
        notFound: NOT_FOUND,
      }
    );

    expect(message).toBe('Failed to fetch');
  });

  test('falls back to a generic sentence for a non-Error throw', () => {
    const message = describeOidcClientFailure('nope', { notFound: NOT_FOUND });

    expect(message).toBe('Network error');
  });
});
