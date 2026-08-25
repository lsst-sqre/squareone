/**
 * Scope → admin page mapping.
 *
 * Gafaelfawr's per-endpoint scopes are Helm-configurable per Phalanx
 * environment and are not discoverable at runtime, so Squareone cannot infer
 * which scope guards which admin API. Instead each admin page declares a fixed
 * *page id*, and deployments map those ids to the scopes that actually guard
 * them via the `adminPageScopes` key in `squareone.config.yaml`.
 *
 * Access is **any-of**: a user may use a page when they hold at least one of
 * the scopes configured for it. Configuring an empty list therefore hides the
 * page from everyone, which is the supported way to switch a page off for an
 * environment.
 *
 * Every helper here takes the resolved app config as its first argument so
 * that callers can never accidentally evaluate access against the built-in
 * defaults when a deployment has overridden them. (The PRD sketches these as
 * `hasAdminPageAccess(scopes, pageId)`; threading the config explicitly is the
 * same interface with the configuration made non-optional rather than
 * silently defaulted.)
 */

/**
 * Page ids of the scope-gated admin pages, fixed by the application.
 *
 * These are the only keys accepted under `adminPageScopes`; the config schema
 * rejects anything else. This list is not the navigation — nav order and the
 * set of pages that actually exist stay code-defined in `adminNavigation.ts`.
 */
export const ADMIN_PAGE_IDS = [
  'notifications',
  'serviceTokens',
  'oidcClients',
  'sentry',
] as const;

/** Id of a scope-gated admin page. */
export type AdminPageId = (typeof ADMIN_PAGE_IDS)[number];

/**
 * The `adminPageScopes` config value: page id → the scopes that grant access.
 *
 * Partial because a deployment may override only the pages it cares about;
 * the rest resolve to {@link DEFAULT_ADMIN_PAGE_SCOPES}.
 */
export type AdminPageScopes = Partial<Record<AdminPageId, string[]>>;

/** Fully-resolved mapping, with every page id present. */
export type ResolvedAdminPageScopes = Record<AdminPageId, string[]>;

/**
 * Scopes each admin page requires when `adminPageScopes` (or an individual
 * page within it) is omitted.
 *
 * These match Gafaelfawr's out-of-the-box admin scopes, so existing
 * deployments need no config change. Kept in sync with the `default` values in
 * `squareone.config.schema.json`.
 */
export const DEFAULT_ADMIN_PAGE_SCOPES: ResolvedAdminPageScopes = {
  notifications: ['admin:notifications'],
  serviceTokens: ['admin:token'],
  oidcClients: ['admin:oidc'],
  sentry: ['exec:admin'],
};

/**
 * The slice of the app config these helpers read.
 *
 * Structural rather than `AppConfig` so this module stays importable from
 * tests and from the config loader itself without a circular import.
 */
export type AdminPageScopesConfig = {
  adminPageScopes?: AdminPageScopes;
} | null;

/**
 * Resolve the effective scope mapping for every admin page.
 *
 * Missing pages — and a missing `adminPageScopes` key altogether — fall back
 * to {@link DEFAULT_ADMIN_PAGE_SCOPES}. An explicitly-configured empty list is
 * preserved (it hides the page) rather than being treated as "unset".
 */
export function resolveAdminPageScopes(
  config: AdminPageScopesConfig | undefined
): ResolvedAdminPageScopes {
  const configured = config?.adminPageScopes;

  return Object.fromEntries(
    ADMIN_PAGE_IDS.map((pageId) => [
      pageId,
      configured?.[pageId] ?? DEFAULT_ADMIN_PAGE_SCOPES[pageId],
    ])
  ) as ResolvedAdminPageScopes;
}

/**
 * Whether a user holding `userScopes` may use the admin page `pageId`.
 *
 * Any-of: one matching scope is enough.
 */
export function hasAdminPageAccess(
  config: AdminPageScopesConfig | undefined,
  userScopes: readonly string[],
  pageId: AdminPageId
): boolean {
  return resolveAdminPageScopes(config)[pageId].some((scope) =>
    userScopes.includes(scope)
  );
}

/**
 * Whether a user holding `userScopes` may use *any* admin page.
 *
 * This is the union rule that gates the admin section as a whole (the
 * `/admin` prefix and the header's "Admin" link): a user who can reach no
 * admin page has no business in the section.
 */
export function hasAnyAdminAccess(
  config: AdminPageScopesConfig | undefined,
  userScopes: readonly string[]
): boolean {
  const resolved = resolveAdminPageScopes(config);

  return ADMIN_PAGE_IDS.some((pageId) =>
    resolved[pageId].some((scope) => userScopes.includes(scope))
  );
}
