/**
 * The single home of the `/admin` route handlers' authorization assumption.
 *
 * Route handlers under `/admin` perform **no** in-app authorization. Access is
 * delegated entirely to the Phalanx `GafaelfawrIngress` that fronts the
 * `/admin` path prefix (`applications/squareone/templates/ingress-admin.yaml`
 * in phalanx), which requires the admin scope before a request ever reaches
 * this app. The client-side `AdminRequired` gate is a rendering convenience for
 * pages, not a check — it never runs for a route handler.
 *
 * That single-layer arrangement is fine as long as it actually holds, and this
 * guard is what makes it hold rather than merely be documented: a request that
 * arrives without the identity header Gafaelfawr stamps on everything it
 * authorizes did not cross the ingress, so nobody authorized it, and it is
 * refused. Every route handler under `/admin` calls this first —
 * `src/tests/adminRouteHandlers.test.ts` fails the build if a new one forgets.
 *
 * What this does **not** do: it is not an authorization check and cannot be
 * one. It does not look at scopes, it trusts a header that only the ingress can
 * set on a request reaching the pod, and it asserts nothing about *which*
 * operator is calling. It defends against the ingress being missing,
 * misconfigured onto the wrong prefix, or bypassed from inside the cluster —
 * i.e. against the invariant silently ceasing to be true. If the ingress rule
 * is ever relaxed so unauthorized users can reach `/admin`, real in-app checks
 * have to be added; this guard would not notice.
 *
 * The client half of the same arrangement is `src/lib/admin/adminFetch.ts`.
 */

import { NextResponse } from 'next/server';

/**
 * Header Gafaelfawr sets on every request it authorizes.
 *
 * `X-Auth-Request-User` carries the authenticated username and is set
 * unconditionally on a successful `/ingress/auth` subrequest, then lifted onto
 * the backend request by ingress-nginx's `auth-response-headers`. ingress-nginx
 * replaces the incoming value with the subrequest's (or drops it entirely), so
 * a client cannot forge it past the ingress — but a request that never passed
 * through the ingress carries whatever it likes, which is why this check is
 * evidence of routing, not of identity.
 */
export const ADMIN_INGRESS_USER_HEADER = 'X-Auth-Request-User';

/**
 * Whether the guard enforces in the current runtime.
 *
 * Read per call rather than at module load so a test can stub the environment.
 * `next dev` serves `/admin` with no Gafaelfawr in front of it, so the guard
 * stands down there and nowhere else: every other runtime — production,
 * `next start`, test — is treated as one that ought to be behind the ingress,
 * so an environment this code does not recognize fails closed instead of open.
 */
function isEnforcing(): boolean {
  return process.env.NODE_ENV !== 'development';
}

/**
 * Refuse a request to an `/admin` route handler that did not cross the ingress.
 *
 * @param request The incoming request, as handed to the route handler.
 * @returns A 403 response the handler must return as-is, or `null` when the
 *   request may proceed.
 *
 * @example
 * ```ts
 * export async function POST(request: Request) {
 *   const denied = requireAdminIngress(request);
 *   if (denied) return denied;
 *   // …
 * }
 * ```
 */
export function requireAdminIngress(request: Request): NextResponse | null {
  if (!isEnforcing()) return null;
  if (request.headers.get(ADMIN_INGRESS_USER_HEADER)) return null;

  return NextResponse.json(
    {
      error: 'not_behind_ingress',
      message:
        'This endpoint is only reachable through the authenticated /admin ingress.',
    },
    { status: 403 }
  );
}
