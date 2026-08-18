/**
 * `fetch` for the app's own `/admin` route handlers.
 *
 * Every browser call to a path under `/admin` crosses the Phalanx
 * `GafaelfawrIngress` that fronts the prefix (see
 * `src/lib/admin/requireAdminIngress.ts` for the server half of that
 * arrangement), and that ingress is configured with `loginRedirect: true`. When
 * the operator's session has expired, an unflagged request therefore gets a 302
 * toward CILogon rather than an error: `fetch` follows it cross-origin by
 * default, the redirect fails CORS, and the caller sees an opaque
 * `TypeError: Failed to fetch` with no status to report — a phantom transport
 * failure standing in for a plain "your session ended".
 *
 * Gafaelfawr answers a request carrying `X-Requested-With: XMLHttpRequest` with
 * a direct 403 instead of that redirect, precisely because a background request
 * is not under the browser window's control and cannot complete a login flow.
 * So this helper sets that header on every `/admin` call and callers report the
 * status they get back.
 *
 * What this does **not** do: it is not a CSRF defense and not an authorization
 * check. Gafaelfawr uses the header only to choose between 401-with-redirect
 * and 403; the authorization itself happens at the ingress, before the request
 * reaches this app at all.
 *
 * Any new client call to an `/admin` route handler should go through here
 * rather than repeat the header — that is what keeps the rationale in one
 * place.
 */

/** The header that turns an expired session's redirect into a readable 403. */
const XHR_HEADER = 'X-Requested-With';
const XHR_HEADER_VALUE = 'XMLHttpRequest';

/**
 * Call an `/admin` route handler with the XHR flag the ingress needs.
 *
 * Behaves exactly like `fetch` otherwise — including returning `fetch`'s own
 * promise, so a caller that renders an in-flight state stays in it for the real
 * duration of the request.
 *
 * @param path Path of the route handler, e.g. `/admin/sentry/emit-log`.
 * @param init Standard `fetch` init; its headers are preserved.
 */
export function adminFetch(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(init.headers);
  // Set (not append) last: the header is this helper's contract with the
  // ingress, so a caller cannot accidentally weaken it.
  headers.set(XHR_HEADER, XHR_HEADER_VALUE);
  return fetch(path, { ...init, headers });
}
