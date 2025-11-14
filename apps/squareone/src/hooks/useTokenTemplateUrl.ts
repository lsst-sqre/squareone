import { useMemo } from 'react';
import type { TokenFormValues } from '../components/TokenForm';

/**
 * Hook that generates a shareable template URL for token creation forms.
 *
 * Creates a URL with query parameters that can be used to pre-fill the token
 * creation form. The URL includes the token name, selected scopes, and
 * expiration settings as query parameters.
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
 * // Returns: "https://example.com/settings/tokens/new?name=My+Token&scope=read%3Aall&scope=user%3Atoken&expiration=30d"
 * ```
 */
export default function useTokenTemplateUrl(
  baseUrl: string,
  values: TokenFormValues
): string {
  return useMemo(() => {
    const params = new URLSearchParams();

    if (values.name?.trim()) {
      params.append('name', values.name.trim());
    }

    if (values.scopes && values.scopes.length > 0) {
      values.scopes.forEach((scope) => {
        params.append('scope', scope);
      });
    }

    if (values.expiration) {
      if (values.expiration.type === 'never') {
        params.append('expiration', 'never');
      } else if (values.expiration.type === 'preset') {
        params.append('expiration', values.expiration.value);
      }
    }

    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  }, [baseUrl, values.name, values.scopes, values.expiration]);
}
