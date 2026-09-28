import React, { Fragment } from 'react';

type ScopeListProps = {
  /** Scope names, in the order they should be read. */
  scopes: readonly string[];
  /**
   * The word that joins the last scope. Defaults to "or" because scope
   * requirements in this app are usually any-of: holding one of the listed
   * scopes is enough. Use "and" when the sentence names every scope in a set.
   */
  conjunction?: 'and' | 'or';
};

/**
 * The separator that precedes the scope at `index` in a list of `total`.
 */
function separatorBefore(
  index: number,
  total: number,
  conjunction: 'and' | 'or'
): string {
  if (index === 0) return '';
  if (index < total - 1) return ', ';
  return total > 2 ? `, ${conjunction} ` : ` ${conjunction} `;
}

/**
 * Renders Gafaelfawr scope names as an inline prose list.
 *
 * Each scope is marked up as `<code>` and the list is joined the way it would
 * be read aloud — `admin:token`, `admin:token or exec:admin`, `a, b, or c` —
 * so a sentence can name the scopes a gate is asking for without the caller
 * re-deriving the punctuation. An empty list renders nothing, which is what a
 * page configured with no scopes at all (i.e. switched off) needs.
 *
 * @example
 * ```tsx
 * <p>
 *   You do not have <ScopeList scopes={requiredScopes} />, which is required
 *   to create service tokens.
 * </p>
 * ```
 */
export default function ScopeList({
  scopes,
  conjunction = 'or',
}: ScopeListProps) {
  return (
    <>
      {scopes.map((scope, index) => (
        <Fragment key={scope}>
          {separatorBefore(index, scopes.length, conjunction)}
          <code>{scope}</code>
        </Fragment>
      ))}
    </>
  );
}
