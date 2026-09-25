import type { ReactNode } from 'react';

import type { ServiceLinkResult } from '../../lib/serviceLink/types';
import { CtaLink } from '../Typography';

/** How the link renders: inline in prose, or as a call-to-action button. */
export type ServiceLinkVariant = 'inline' | 'cta';

export type ServiceLinkProps = {
  /** Resolved outcome of looking the UI service up in service discovery. */
  result: ServiceLinkResult;
  /**
   * Link text. When omitted (the self-closing `<ServiceLink />` form), the
   * link text is the service's URL without its trailing slash.
   */
  children?: ReactNode;
  /**
   * `inline` (default) for a link in prose, or `cta` for a call-to-action
   * button (the MDX `CtaLink` style).
   */
  variant?: ServiceLinkVariant;
};

/** A discovered URL as link text: trailing slashes stripped. */
function displayUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

/**
 * A link to a UI service's URL from Repertoire service discovery, for the
 * `<ServiceLink service="…">` MDX tag.
 *
 * The page resolves discovery server-side and passes the outcome in:
 * - `ok` -> a link to the discovered URL, with `children` as its text, or the
 *   URL itself (without its trailing slash) when self-closing;
 * - `omitted` (no `repertoireUrl`), `unavailable` (discovery failed), or
 *   `missing` (no such UI service) -> no link: `children` render as plain
 *   text, and nothing renders when self-closing. A `cta` renders nothing at
 *   all, since a call-to-action label without a link would mislead.
 *
 * Purely props-driven (no data fetching), so it renders from Storybook and
 * unit tests.
 */
export default function ServiceLink({
  result,
  children,
  variant = 'inline',
}: ServiceLinkProps) {
  if (result.status !== 'ok') {
    return variant === 'cta' ? null : (children ?? null);
  }

  const text = children ?? displayUrl(result.url);
  if (variant === 'cta') {
    return <CtaLink href={result.url}>{text}</CtaLink>;
  }
  return <a href={result.url}>{text}</a>;
}
