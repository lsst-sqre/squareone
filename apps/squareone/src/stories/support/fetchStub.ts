/**
 * Shared helpers for the `window.fetch` stubs that app stories install.
 *
 * Several stories replace `window.fetch` so a play function can drive a whole
 * round trip against a route that only exists in the Next.js app. Each such
 * stub has to answer the same two questions about a call it is handed — which
 * URL, and which method — and `fetch`'s signature makes both awkward: the URL
 * arrives as a string, a `URL`, or a `Request`, and the method lives on the
 * init for the first two forms but on the input itself for the third.
 *
 * Re-deriving that per stub is how a stub ends up matching on a substring of a
 * URL. When such a match silently stops intercepting, the request escapes to
 * the network, 404s against the Storybook dev server, and the play function
 * times out several assertions away from the cause — so the normalization is
 * written once, here, and tested.
 *
 * Story-support only: nothing in the app bundle imports this module.
 */

/** Resolve the URL of a `fetch` call regardless of which input form was used. */
export function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

/**
 * Resolve the method of a `fetch` call, uppercased, defaulting to `GET`.
 *
 * A `Request` input carries its own method and is typically passed with no init
 * at all, so reading only the init would report every such call as a `GET`.
 */
export function requestMethod(
  input: RequestInfo | URL,
  init?: RequestInit
): string {
  if (init?.method) return init.method.toUpperCase();
  if (typeof input !== 'string' && !(input instanceof URL)) {
    return input.method.toUpperCase();
  }
  return 'GET';
}

/** What a stub is willing to answer: one exact path, one method. */
type RequestPattern = {
  /** Path to match exactly — not a prefix, suffix or substring. */
  pathname: string;
  /** Method to match, case-insensitively. Defaults to `GET`, as `fetch` does. */
  method?: string;
};

/**
 * Report whether a `fetch` call is the one a stub means to answer.
 *
 * The path is compared as a parsed `pathname`, so a query string, a fragment or
 * an absolute origin on the request does not change the verdict, and a longer
 * path that merely ends with the pattern is not a match.
 */
export function matchesRequest(
  input: RequestInfo | URL,
  init: RequestInit | undefined,
  { pathname, method = 'GET' }: RequestPattern
): boolean {
  if (requestMethod(input, init) !== method.toUpperCase()) return false;
  return new URL(requestUrl(input), window.location.href).pathname === pathname;
}

/**
 * Hold every cross-origin `fetch` for the life of a story, as a `beforeEach`.
 *
 * Stories that seed their query cache from `mockDiscovery` inherit its live
 * RSP URLs (`https://data.lsst.cloud/...`), so any query the story did not
 * seed — or one that refetches once its seeded data goes stale — would
 * otherwise reach the real platform. A held request never settles, so the
 * query keeps its seeded data (or stays pending) instead of flipping into an
 * error state. Same-origin requests, Storybook's own included, still go to the
 * network. The returned cleanup restores the replaced `fetch`.
 */
export function holdCrossOriginFetch(): () => void {
  const originalFetch = window.fetch;
  window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(requestUrl(input), window.location.href);
    if (url.origin !== window.location.origin) {
      return new Promise<Response>(() => {});
    }
    return originalFetch(input, init);
  }) as typeof window.fetch;
  return () => {
    window.fetch = originalFetch;
  };
}
