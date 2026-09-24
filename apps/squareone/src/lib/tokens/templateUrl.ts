import { type ExpirationValue, parseExpirationFromQuery } from './expiration';

/** App path of the user token creation page. */
export const NEW_TOKEN_PATH = '/settings/tokens/new';

/**
 * Token creation form values that a template URL can prefill. Structurally a
 * `Partial<TokenFormValues>`.
 */
export type TokenTemplateValues = {
  name?: string;
  scopes?: string[];
  expiration?: ExpirationValue;
};

/**
 * The subset of `URLSearchParams` the parser reads, so it accepts both
 * `URLSearchParams` and Next.js's `ReadonlyURLSearchParams`.
 */
type SearchParamsReader = Pick<URLSearchParams, 'get' | 'getAll'>;

/**
 * Build a template URL that prefills the token creation form at `baseUrl`.
 *
 * Emits, in order and only when set: `name` (trimmed), `scopes` (a single
 * comma-separated list, e.g. `scopes=read:tap,read:image` before encoding),
 * and `expiration` (a preset such as `30d`, or `never`). This is the format
 * {@link parseTokenTemplateParams} reads, so the URL round-trips through the
 * token creation page. Returns `baseUrl` unchanged when nothing is set.
 *
 * @example
 * ```ts
 * buildTokenTemplateUrl('/settings/tokens/new', { scopes: ['read:tap'] });
 * // '/settings/tokens/new?scopes=read%3Atap'
 * ```
 */
export function buildTokenTemplateUrl(
  baseUrl: string,
  values: TokenTemplateValues
): string {
  const params = new URLSearchParams();

  const name = values.name?.trim();
  if (name) {
    params.append('name', name);
  }

  if (values.scopes && values.scopes.length > 0) {
    params.append('scopes', values.scopes.join(','));
  }

  if (values.expiration) {
    params.append(
      'expiration',
      values.expiration.type === 'never' ? 'never' : values.expiration.value
    );
  }

  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Parse the token creation page's search parameters into form prefill values.
 *
 * Reads `name` (trimmed; ignored when blank), `scopes` (comma-separated), and
 * `expiration` (a known preset or `never`; anything else is ignored). The
 * legacy repeated `scope` parameter — which template URLs used to emit — is
 * accepted too and merged after `scopes`. Scope names are trimmed, and empty
 * and duplicate entries dropped. Keys are only set when a usable value is
 * present.
 */
export function parseTokenTemplateParams(
  searchParams: SearchParamsReader
): TokenTemplateValues {
  const values: TokenTemplateValues = {};

  const name = searchParams.get('name')?.trim();
  if (name) {
    values.name = name;
  }

  const scopes = [
    ...searchParams.getAll('scopes'),
    ...searchParams.getAll('scope'),
  ]
    .flatMap((value) => value.split(','))
    .map((scope) => scope.trim())
    .filter((scope) => scope.length > 0);
  if (scopes.length > 0) {
    values.scopes = [...new Set(scopes)];
  }

  const expirationParam = searchParams.get('expiration');
  if (expirationParam) {
    const expiration = parseExpirationFromQuery(expirationParam);
    if (expiration) {
      values.expiration = expiration;
    }
  }

  return values;
}
