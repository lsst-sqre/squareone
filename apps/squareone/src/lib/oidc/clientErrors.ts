/**
 * Shared failure copy for the OpenID Connect client admin flows.
 */
import { toGafaelfawrErrorInfo } from '@lsst-sqre/gafaelfawr-client';

/**
 * The scope Gafaelfawr itself requires on every OpenID Connect client
 * endpoint.
 *
 * Distinct from the `adminPageScopes` mapping that decides who is *offered*
 * these pages: that one is deployment-configurable, while this one is fixed by
 * the API, so a 403 coming back from Gafaelfawr can name it outright.
 */
export const OIDC_API_SCOPE = 'admin:oidc';

export type DescribeOidcClientFailureOptions = {
  /**
   * What a 404 means at this call site.
   *
   * Gafaelfawr overloads the status: on the collection endpoints it means the
   * environment has no OpenID Connect server at all, while on a per-client
   * route it means that client is gone. Neither sentence is derivable from the
   * response, so the caller supplies the one that fits.
   */
  notFound: string;
};

/**
 * Turn a failed OpenID Connect client request into the sentence a page should
 * show inline.
 *
 * Most failures — a 422 above all, the common one on these forms — already
 * carry Gafaelfawr's own `ErrorModel` detail, which names the offending field
 * and is far more useful than anything this app could invent, so those pass
 * through verbatim. The two exceptions are the statuses whose bare message
 * says nothing actionable: a 403, whose body reads only "Permission denied",
 * is really "you are missing a scope"; and a 404, whose meaning depends on the
 * endpoint and so comes from the caller.
 *
 * @param error - Anything thrown by a client function or mutation hook
 * @param options - Call-site copy, currently just the 404 sentence
 * @returns A sentence to render inline, with the operator's input intact
 */
export function describeOidcClientFailure(
  error: unknown,
  { notFound }: DescribeOidcClientFailureOptions
): string {
  const { status, message } = toGafaelfawrErrorInfo(error);

  if (status === 403) {
    return `Gafaelfawr refused this request: your account does not hold the ${OIDC_API_SCOPE} scope that the OpenID Connect client API requires. Contact your administrator to request it.`;
  }

  if (status === 404) {
    return notFound;
  }

  return message;
}
