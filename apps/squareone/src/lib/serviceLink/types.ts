/**
 * The outcome of resolving a `<ServiceLink>` MDX tag's UI service URL from
 * Repertoire service discovery.
 *
 * - `omitted`: no `repertoireUrl` configured, so discovery isn't consulted.
 * - `unavailable`: discovery was configured but the fetch/parse failed.
 * - `missing`: discovery succeeded but lists no UI service by that name.
 * - `ok`: the UI service's discovered `url`, as published (typically with a
 *   trailing slash).
 *
 * Every status but `ok` renders no link.
 */
export type ServiceLinkResult =
  | { status: 'omitted' }
  | { status: 'unavailable' }
  | { status: 'missing' }
  | { status: 'ok'; url: string };
