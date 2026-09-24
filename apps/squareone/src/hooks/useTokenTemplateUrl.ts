import { useMemo } from 'react';
import type { TokenFormValues } from '../components/TokenForm';
import { buildTokenTemplateUrl } from '../lib/tokens/templateUrl';

/**
 * Hook that generates a shareable template URL for token creation forms.
 *
 * Creates a URL with query parameters that can be used to pre-fill the token
 * creation form. The URL includes the token name, selected scopes (as one
 * comma-separated `scopes` parameter), and expiration settings — the format
 * the token creation page parses (see {@link buildTokenTemplateUrl}).
 *
 * @param baseUrl - The base URL for the token creation page (e.g., "https://example.com/settings/tokens/new")
 * @param values - The form values to encode in the template URL
 * @returns A URL string with query parameters, or the base URL if no parameters are present
 *
 * @example
 * ```tsx
 * const templateUrl = useTokenTemplateUrl(
 *   'https://example.com/settings/tokens/new',
 *   {
 *     name: 'My Token',
 *     scopes: ['read:all', 'user:token'],
 *     expiration: { type: 'preset', value: '30d' }
 *   }
 * );
 * // Returns: "https://example.com/settings/tokens/new?name=My+Token&scopes=read%3Aall%2Cuser%3Atoken&expiration=30d"
 * ```
 */
export default function useTokenTemplateUrl(
  baseUrl: string,
  values: TokenFormValues
): string {
  const { name, scopes, expiration } = values;
  return useMemo(
    () => buildTokenTemplateUrl(baseUrl, { name, scopes, expiration }),
    [baseUrl, name, scopes, expiration]
  );
}
