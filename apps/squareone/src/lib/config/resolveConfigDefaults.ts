/**
 * Discovery-backed defaults for the config keys that no longer need to be set
 * per environment.
 *
 * `siteName`, `environmentName`, and `baseUrl` are optional in
 * `squareone.config.yaml`. When a key is unset (or an empty string) it is
 * filled, in order of precedence, from:
 *
 * | Key               | 1. Config | 2. Repertoire discovery          | 3. Fallback                          |
 * | ----------------- | --------- | -------------------------------- | ------------------------------------ |
 * | `siteName`        | set value | `environment.title`              | `"Rubin Science Platform"`           |
 * | `environmentName` | set value | `environment.label`              | `"unknown"`                          |
 * | `baseUrl`         | set value | `services.ui.squareone.url` [^1] | request origin from headers [^2]     |
 *
 * [^1]: With trailing slashes stripped.
 * [^2]: `X-Forwarded-Proto` (default `http`) and `X-Forwarded-Host`, falling
 *       back to `Host`. {@link FALLBACK_BASE_URL} is the last resort when no
 *       usable host header is available.
 *
 * Discovery from Repertoire 2.x has no `environment` object or squareone UI
 * service, so those environments fall through to the fallbacks.
 */

import {
  createDiscoveryQuery,
  type ServiceDiscovery,
} from '@lsst-sqre/repertoire-client';

import type { AppConfig } from './loader';

/** Site name used when neither config nor discovery provides one. */
export const DEFAULT_SITE_NAME = 'Rubin Science Platform';

/** Environment name used when neither config nor discovery provides one. */
export const DEFAULT_ENVIRONMENT_NAME = 'unknown';

/**
 * Last-resort base URL, used only when config, discovery, and the request
 * headers all fail to provide one (e.g. no usable `Host` header).
 */
export const FALLBACK_BASE_URL = 'http://localhost:3000';

/** Config keys that {@link resolveConfigDefaults} fills in when unset. */
export type DefaultedConfigKey = 'siteName' | 'environmentName' | 'baseUrl';

/**
 * The application configuration as consumed by the app: {@link AppConfig}
 * with the discovery-backed keys always resolved.
 */
export type StaticConfig = Omit<AppConfig, DefaultedConfigKey> &
  Required<Pick<AppConfig, DefaultedConfigKey>>;

/**
 * The subset of the `Headers` interface this module reads. Satisfied by
 * `Headers` and by the `ReadonlyHeaders` returned from `next/headers`.
 */
export type RequestHeaders = Pick<Headers, 'get'>;

/**
 * Fill the unset discovery-backed config keys (`siteName`,
 * `environmentName`, `baseUrl`) following the precedence documented on this
 * module. Explicitly configured values always win.
 *
 * @param config - The validated config from `squareone.config.yaml`.
 * @param discovery - Repertoire service discovery, or null when Repertoire is
 *   not configured or unavailable.
 * @param requestHeaders - The incoming request's headers, or null when they
 *   were not read (see {@link needsRequestHeaders}).
 * @returns A new config object; `config` is not modified.
 */
export function resolveConfigDefaults(
  config: AppConfig,
  discovery: ServiceDiscovery | null,
  requestHeaders: RequestHeaders | null
): StaticConfig {
  const environment = discovery
    ? createDiscoveryQuery(discovery).getEnvironment()
    : null;

  return {
    ...config,
    siteName: firstNonEmpty(
      config.siteName,
      environment?.title,
      DEFAULT_SITE_NAME
    ),
    environmentName: firstNonEmpty(
      config.environmentName,
      environment?.label,
      DEFAULT_ENVIRONMENT_NAME
    ),
    baseUrl: firstNonEmpty(
      config.baseUrl,
      getDiscoveryBaseUrl(discovery),
      requestHeaders ? getOriginFromHeaders(requestHeaders) : null,
      FALLBACK_BASE_URL
    ),
  };
}

/**
 * Whether resolving `baseUrl` requires the request headers, i.e. neither the
 * config nor discovery provides it. Lets callers avoid reading request headers
 * (a dynamic API in Next.js) when they are not needed.
 */
export function needsRequestHeaders(
  config: AppConfig,
  discovery: ServiceDiscovery | null
): boolean {
  return !config.baseUrl && !getDiscoveryBaseUrl(discovery);
}

/**
 * Whether any discovery-backed key is unset in the config, i.e. whether
 * {@link resolveConfigDefaults} would consult discovery at all.
 */
export function hasUnsetDefaultedKeys(config: AppConfig): boolean {
  return !config.siteName || !config.environmentName || !config.baseUrl;
}

function firstNonEmpty(...values: (string | null | undefined)[]): string {
  return values.find((value) => typeof value === 'string' && value !== '');
}

/** The squareone UI service URL from discovery, without trailing slashes. */
function getDiscoveryBaseUrl(
  discovery: ServiceDiscovery | null
): string | null {
  const url = discovery
    ? createDiscoveryQuery(discovery).getSquareoneUrl()
    : undefined;
  return url ? url.replace(/\/+$/, '') : null;
}

/**
 * The request origin (`<proto>://<host>`) from the forwarding headers set by
 * the ingress, falling back to `Host`. Returns null when no header yields a
 * bare, valid host (anything with a path, userinfo, query, or fragment is
 * rejected).
 */
function getOriginFromHeaders(requestHeaders: RequestHeaders): string | null {
  const host =
    firstHeaderValue(requestHeaders, 'x-forwarded-host') ??
    firstHeaderValue(requestHeaders, 'host');
  if (!host) {
    return null;
  }

  const forwardedProto = firstHeaderValue(
    requestHeaders,
    'x-forwarded-proto'
  )?.toLowerCase();
  const proto =
    forwardedProto === 'https' || forwardedProto === 'http'
      ? forwardedProto
      : 'http';

  // Reject characters that would make URL parsing treat part of the "host" as
  // userinfo, a path, a query, or a fragment, or that are never valid in a
  // host.
  if (/[\s/\\@?#]/.test(host)) {
    return null;
  }

  try {
    return new URL(`${proto}://${host}`).origin;
  } catch {
    return null;
  }
}

/**
 * The first entry of a possibly comma-separated header (proxies append their
 * own value to forwarding headers), trimmed. Null when absent or empty.
 */
function firstHeaderValue(
  requestHeaders: RequestHeaders,
  name: string
): string | null {
  const first = requestHeaders.get(name)?.split(',')[0]?.trim();
  return first ? first : null;
}
