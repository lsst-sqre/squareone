/*
 * Derivation of the header's Apps menu from Repertoire service discovery.
 *
 * The menu lists, in order:
 *
 * 1. Times Square (an internal route) when the `times-square` application is
 *    enabled.
 * 2. Each UI service named in APPS_MENU_SERVICES that discovery lists and the
 *    user may use, labelled by its discovery `title`, in the map's order.
 * 3. The configured `appLinks`, as additive extras for apps discovery does not
 *    describe (for example USDF's FOV Quicklook), skipping any whose href is
 *    already listed.
 */

import type { ServiceDiscoveryQuery } from '@lsst-sqre/repertoire-client';

/** One entry of the header's Apps menu (same shape as a config `appLinks` item). */
export type AppsMenuItem = {
  label: string;
  href: string;
  internal: boolean;
};

/**
 * The discovery UI services eligible for the Apps menu, in menu order, each
 * with its **associated scopes**: the Gafaelfawr scopes a user must hold to see
 * the entry when discovery declares no `required_scopes` for the service.
 *
 * Argo CD and Chronograf are not Gafaelfawr-gated (they have their own logins),
 * so discovery declares no scopes for them; `exec:admin` stands in for "who
 * can use them" so they are not advertised to every user. When discovery does
 * declare `required_scopes`, those take precedence over the associated scopes.
 */
export const APPS_MENU_SERVICES: Readonly<Record<string, readonly string[]>> = {
  argocd: ['exec:admin'],
  chronograf: ['exec:admin'],
  kafdrop: ['exec:internal-tools'],
  webdav: ['write:files'],
};

export type DeriveAppsMenuItemsArgs = {
  /** Service discovery, or null when it is not configured or still loading. */
  query: ServiceDiscoveryQuery | null;
  /**
   * The signed-in user's scopes; undefined for an anonymous visitor or while
   * login info is loading. Unknown scopes count as holding none, so the
   * scope-gated discovery items are hidden until the user's scopes are known.
   */
  userScopes: readonly string[] | undefined;
  /** The configured `appLinks`, appended as additive extras. */
  appLinks: readonly AppsMenuItem[];
  /** Whether the `times-square` application is enabled. */
  timesSquareEnabled: boolean;
};

const TIMES_SQUARE_ITEM: AppsMenuItem = {
  label: 'Times Square',
  href: '/times-square/',
  internal: true,
};

/**
 * Stand-in origin for resolving relative hrefs when discovery has no
 * `squareone` UI service; relative hrefs then only match each other.
 */
const FALLBACK_BASE_URL = 'https://squareone.invalid/';

/**
 * Derive the Apps menu items (see the module comment for the order).
 *
 * Unlike the Portal and Notebooks header entries (which `canAccessService`
 * shows while scopes are unknown), a discovery-derived item needs the user's
 * scopes to be known: the associated scopes exist precisely to keep admin
 * tools from being advertised to users who cannot use them. Times Square and
 * the configured `appLinks` are shown regardless of scopes, as before.
 *
 * Duplicate hrefs are dropped (the first entry wins). Hrefs are compared after
 * resolving relative ones against the `squareone` UI service URL and ignoring
 * a trailing slash, so a configured `/argo-cd/` matches the discovered
 * `https://data.lsst.cloud/argo-cd`.
 */
export function deriveAppsMenuItems({
  query,
  userScopes,
  appLinks,
  timesSquareEnabled,
}: DeriveAppsMenuItemsArgs): AppsMenuItem[] {
  const candidates: AppsMenuItem[] = [];
  if (timesSquareEnabled) {
    candidates.push(TIMES_SQUARE_ITEM);
  }
  if (query) {
    candidates.push(...deriveServiceItems(query, userScopes ?? []));
  }
  candidates.push(...appLinks);

  const baseUrl = query?.getSquareoneUrl() ?? FALLBACK_BASE_URL;
  const seen = new Set<string>();
  return candidates.filter((item) => {
    const key = hrefKey(item.href, baseUrl);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** The eligible UI services the user may use, in APPS_MENU_SERVICES order. */
function deriveServiceItems(
  query: ServiceDiscoveryQuery,
  userScopes: readonly string[]
): AppsMenuItem[] {
  const items: AppsMenuItem[] = [];
  for (const [name, associatedScopes] of Object.entries(APPS_MENU_SERVICES)) {
    const service = query.getUiService(name);
    if (!service) continue;
    const declaredScopes = service.required_scopes ?? [];
    const requiredScopes =
      declaredScopes.length > 0 ? declaredScopes : associatedScopes;
    if (
      !query.canAccessService({ required_scopes: requiredScopes }, userScopes)
    ) {
      continue;
    }
    items.push({
      label: service.title || name,
      href: service.url,
      internal: false,
    });
  }
  return items;
}

/** Comparison key for an href: resolved against `baseUrl`, sans trailing slash. */
function hrefKey(href: string, baseUrl: string): string {
  try {
    const url = new URL(href, baseUrl);
    const pathname = url.pathname.replace(/\/+$/, '');
    return `${url.origin}${pathname}${url.search}${url.hash}`;
  } catch {
    return href;
  }
}
