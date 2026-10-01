import type { LoginInfo } from '@lsst-sqre/gafaelfawr-client';

import type { Scope } from '../../components/TokenForm';
import type { TokenTemplateValues } from './templateUrl';

/**
 * The scopes the logged-in user can grant to a new user token: those
 * Gafaelfawr's configuration describes that the user also holds.
 *
 * The type guard is required because this app sets `strictNullChecks: false`,
 * which makes Zod infer a configured scope's name/description as optional; it
 * narrows them back to the required-field `Scope` the token form expects.
 */
export function getGrantableScopes(loginInfo: LoginInfo): Scope[] {
  return loginInfo.config.scopes.filter(
    (scope): scope is Scope =>
      scope.name !== undefined &&
      scope.description !== undefined &&
      loginInfo.scopes.includes(scope.name)
  );
}

/**
 * Restrict a template URL's prefill values to the scopes the user can grant.
 *
 * A template URL can request scopes the user does not hold, but the token form
 * only offers checkboxes for `grantableScopes`, so such a scope would sit in
 * the form state unseen and make Gafaelfawr reject the submission. This keeps
 * the grantable subset (in requested order) and reports the rest as
 * `droppedScopes` so the page can say what it left out. `values.scopes` is
 * omitted from the result when no requested scope survives.
 */
export function restrictToGrantableScopes(
  values: TokenTemplateValues,
  grantableScopes: readonly Scope[]
): { values: TokenTemplateValues; droppedScopes: string[] } {
  const { scopes: requestedScopes = [], ...otherValues } = values;
  const grantableNames = new Set(grantableScopes.map((scope) => scope.name));
  const scopes = requestedScopes.filter((scope) => grantableNames.has(scope));
  const droppedScopes = requestedScopes.filter(
    (scope) => !grantableNames.has(scope)
  );
  return {
    values: scopes.length > 0 ? { ...otherValues, scopes } : otherValues,
    droppedScopes,
  };
}
