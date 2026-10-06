// The delegated internal token the mocked Gafaelfawr accepts, standing in for
// the `X-Auth-Request-Token` a GafaelfawrIngress sends the pod in production.
//
// `next dev` has no ingress in front of it, so to exercise the server-side
// auth prefetches' delegated mode locally, send the headers the ingress would:
//
//   curl -H 'X-Auth-Request-User: vera' \
//        -H 'X-Auth-Request-Token: gt-dev-delegated-token' \
//        http://localhost:3000/times-square
//
// The root layout then presents the token as a bearer token to the mocked
// `/auth/api/v1/user-info` and `/auth/api/v1/token-info` routes, which answer
// for the `/dev` persona. See docs/dev/development-tasks.rst.
//
// Colocated with the rest of the dev tooling so it never reaches the
// production build.

/** The bearer token value the dev Gafaelfawr mocks accept. */
export const DEV_DELEGATED_TOKEN = 'gt-dev-delegated-token';

/**
 * The token key the mocked `/token-info` reports for the delegated token
 * (Gafaelfawr token keys are 22 characters).
 */
export const DEV_DELEGATED_TOKEN_KEY = 'gt-dev0delegated0token';

/**
 * How a request to a mocked Gafaelfawr endpoint authenticated, mirroring real
 * Gafaelfawr: a bearer `Authorization` header is checked first and must be
 * the dev delegated token; without one, the mocked session (dev state) stands
 * in for the session cookie.
 */
export type DevAuthResult = 'delegated' | 'session' | 'unauthenticated';

export function devAuthFor(
  request: Request,
  sessionLoggedIn: boolean
): DevAuthResult {
  const authorization = request.headers.get('authorization');
  if (authorization) {
    const [scheme, token] = authorization.split(/\s+/, 2);
    return scheme?.toLowerCase() === 'bearer' && token === DEV_DELEGATED_TOKEN
      ? 'delegated'
      : 'unauthenticated';
  }
  return sessionLoggedIn ? 'session' : 'unauthenticated';
}
