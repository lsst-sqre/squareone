import type { DataService } from '@lsst-sqre/repertoire-client';

/**
 * Which discovery URL to surface for a curated service, overriding the URL
 * discovery itself offers ({@link discoveryServiceUrl}).
 *
 * - `'base'` uses the service's top-level `url`, even when discovery publishes
 *   a single version whose `url` would otherwise be surfaced.
 * - `{ versionKey }` prefers the named version's `url`, falling back to the
 *   base `url` when that version is absent from discovery.
 */
export type UrlSelector = 'base' | { versionKey: string };

/**
 * Editorial presentation for a single discovery service, keyed by the raw
 * service name (e.g. `sia`, `tap`).
 *
 * Every field is optional and overrides one discovery-derived value; an absent
 * field falls through to discovery. {@link PresentationMap} states the
 * precedence rule.
 */
export type ServicePresentation = {
  /** Endpoint label. Overrides the discovery `title`. */
  label?: string;
  /**
   * Label for when discovery has no (or a blank) `title`, as on Repertoire
   * 2.x. Overrides only the raw service name as the last-resort label, so a
   * discovery `title` still wins; ignored when {@link ServicePresentation.label}
   * is set.
   */
  untitledLabel?: string;
  /** IVOA standard documentation URL. Overrides the discovery `docs_url`. */
  ivoaUrl?: string;
  /**
   * Short standard/spec acronym used in an IVOA docs link's accessible label
   * — e.g. `TAP` renders the book-icon link as "IVOA TAP docs". Overrides the
   * name {@link ivoaNameFromLabel} derives from the endpoint label.
   */
  ivoaName?: string;
  /**
   * Which discovery URL to surface. Overrides the URL discovery offers (see
   * {@link discoveryServiceUrl}).
   */
  url?: UrlSelector;
};

/**
 * App-local, editorial presentation map layered over Repertoire discovery.
 *
 * This is squareone-local curation — human labels, IVOA standard links, URL
 * selection, and dataset display names — not part of the shared discovery
 * client.
 *
 * Precedence: each field of a `services` entry overrides the value discovery
 * would otherwise supply, and each absent field falls through to discovery. A
 * service with no entry therefore takes every value from discovery. Per
 * endpoint field:
 *
 * - Label: `label`, else the discovery `title`, else `untitledLabel`, else the
 *   raw service name. A null, empty, or whitespace-only title counts as absent
 *   (see `serviceDisplayName` in `lib/discovery`).
 * - Docs link: `ivoaUrl`, else the discovery `docs_url`, else none. A link to
 *   an IVOA standard (any `ivoaUrl`, or a `docs_url` passing
 *   {@link isIvoaStandardUrl}) is labelled "IVOA <name> docs", named by
 *   `ivoaName`, else via {@link ivoaNameFromLabel} from the resolved label;
 *   any other link is labelled "<label> docs".
 * - URL: the discovery URL chosen by `url` (see {@link selectServiceUrl}),
 *   else the URL discovery offers (see {@link discoveryServiceUrl}): the `url`
 *   of the service's only version when `versions` has exactly one entry, else
 *   the base `url` (zero or several versions, or a lone version without a
 *   `url`).
 *
 * Dataset keys absent from `datasetDisplayNames` fall back to the raw key.
 */
export type PresentationMap = {
  /** Service name -> curated presentation. */
  services: Record<string, ServicePresentation>;
  /** Dataset key -> display name (e.g. `dp1` -> "Data Preview 1"). */
  datasetDisplayNames: Record<string, string>;
};

/**
 * The curated `/api-aspect` presentation map.
 *
 * Labels and IVOA links were signed off against the production idfprod page
 * (DM-55225). `tap` deliberately carries a single generic label — the dataset
 * section header (e.g. "Data Preview 0.3") supplies the ObsTAP/SSO/PPDB context
 * — since the same `tap` service key serves different datasets at different
 * base URLs. SIA selects the `sia-query-2.0` `/query` URL and HiPS the
 * `hips-list-1.0` `/list` URL. TAP, SODA, DataLink, and GMS pin their base
 * URLs with `'base'`, since discovery's own choice would surface the sole
 * version TAP (`tables`) and DataLink (`datalink-links-1.1`) publish. Alerts
 * sets no selector and so takes the URL discovery offers.
 */
export const presentationMap: PresentationMap = {
  services: {
    sia: {
      label: 'Simple Image Access (SIA v2)',
      ivoaUrl: 'https://www.ivoa.net/documents/SIA/',
      ivoaName: 'SIA',
      url: { versionKey: 'sia-query-2.0' },
    },
    hips: {
      label: 'HiPS (Hierarchical Progressive Survey)',
      ivoaUrl: 'https://www.ivoa.net/documents/HiPS',
      ivoaName: 'HiPS',
      url: { versionKey: 'hips-list-1.0' },
    },
    tap: {
      label: 'Table Access Protocol (TAP)',
      ivoaUrl: 'https://www.ivoa.net/documents/TAP/',
      ivoaName: 'TAP',
      url: 'base',
    },
    cutout: {
      label: 'SODA Image Cutouts',
      ivoaUrl: 'https://www.ivoa.net/documents/SODA/20170517/REC-SODA-1.0.html',
      ivoaName: 'SODA',
      url: 'base',
    },
    datalink: {
      label: 'DataLink',
      ivoaUrl: 'https://www.ivoa.net/documents/DataLink/',
      ivoaName: 'DataLink',
      url: 'base',
    },
    gms: {
      label: 'Group Membership Service (GMS)',
      ivoaUrl: 'https://www.ivoa.net/documents/GMS/',
      ivoaName: 'GMS',
      url: 'base',
    },
    // Not an IVOA standard: Repertoire 3.0 discovery supplies its title
    // ("Alert retrieval") and technote docs link, so this only names it on
    // Repertoire 2.x, which publishes no titles.
    alerts: { untitledLabel: 'Alerts' },
  },
  datasetDisplayNames: {
    dp1: 'Data Preview 1',
    dp2: 'Data Preview 2',
    dp02: 'Data Preview 0.2',
    dp03: 'Data Preview 0.3',
    prompt: 'Prompt Products',
  },
};

/** Full data releases outrank every data preview regardless of number. */
const DR_FAMILY_OFFSET = 1_000_000;

/**
 * Rank a release dataset key for display ordering; higher ranks sort earlier.
 *
 * Full data releases (`dr1`, `dr2`, …) outrank all data previews; within a
 * family, newer releases outrank older. Data preview digits with a leading
 * zero are fractional DP0.x releases (`dp03` -> 0.3), so `dp2` > `dp1` >
 * `dp03` > `dp02`. Returns null for keys that don't match a release pattern
 * (including `prompt`, which {@link orderDatasetKeys} pins specially).
 */
export function datasetReleaseRank(key: string): number | null {
  const dr = /^dr(\d+)$/.exec(key);
  if (dr) {
    return DR_FAMILY_OFFSET + Number(dr[1]);
  }
  const dp = /^dp(\d+)$/.exec(key);
  if (dp) {
    const digits = dp[1];
    return digits.startsWith('0')
      ? Number(`0.${digits.slice(1)}`)
      : Number(digits);
  }
  return null;
}

/**
 * Order dataset keys for `/api-aspect` display.
 *
 * Recognized releases sort newest-first per {@link datasetReleaseRank}, with
 * keys that don't match a release pattern following in their given (discovery)
 * order. The evergreen `prompt` dataset is then pinned to the second position.
 */
export function orderDatasetKeys(keys: string[]): string[] {
  const releases = keys
    .map((key) => ({ key, rank: datasetReleaseRank(key) }))
    .filter(
      (entry): entry is { key: string; rank: number } => entry.rank !== null
    )
    .sort((a, b) => b.rank - a.rank)
    .map((entry) => entry.key);
  const unrecognized = keys.filter(
    (key) => key !== 'prompt' && datasetReleaseRank(key) === null
  );
  const ordered = [...releases, ...unrecognized];
  if (keys.includes('prompt')) {
    ordered.splice(1, 0, 'prompt');
  }
  return ordered;
}

/**
 * Whether a documentation URL points at an IVOA standard: a page under
 * `/documents/` on the `www.ivoa.net` or bare `ivoa.net` host (the site serves
 * both), over `https:` or `http:` (older discovery and registry records still
 * cite `http://` IVOA links). Any other scheme or host, and a malformed URL,
 * is not an IVOA link.
 */
export function isIvoaStandardUrl(url: string): boolean {
  try {
    const { protocol, hostname, pathname } = new URL(url);
    return (
      (protocol === 'https:' || protocol === 'http:') &&
      (hostname === 'www.ivoa.net' || hostname === 'ivoa.net') &&
      pathname.startsWith('/documents/')
    );
  } catch {
    return false;
  }
}

/**
 * A trailing parenthetical holding one word, optionally followed by version
 * tokens (`v2`, `1.1`, `v1.0`), capturing the word: `(SSA)`, `(SIA v2)`,
 * `(TAP 1.1)`.
 */
const TRAILING_ACRONYM = /\(\s*([^\s()]+)(?:\s+v?\d+(?:\.\d+)*)*\s*\)\s*$/i;

/**
 * Derive the short standard name for an IVOA docs link's accessible label
 * from an endpoint label, for services without a curated {@link
 * ServicePresentation.ivoaName}.
 *
 * A trailing parenthetical is taken as the acronym when it holds a single
 * word, optionally followed by version tokens only (`v2`, `1.1`, `v1.0`), and
 * that word is returned: `Simple spectral access (SSA)` -> `SSA`, `Simple
 * image access (SIA v2)` -> `SIA`. Any other parenthetical — including a
 * multi-word expansion, so its first word is never mistaken for an acronym —
 * is dropped and the rest of the label is used: `HiPS (Hierarchical
 * Progressive Survey)` -> `HiPS`. A label without a parenthetical is used
 * as-is (`DataLink` -> `DataLink`).
 */
export function ivoaNameFromLabel(label: string): string {
  const acronym = TRAILING_ACRONYM.exec(label);
  if (acronym) {
    return acronym[1];
  }
  return label.replace(/\s*\([^()]*\)/g, '').trim() || label;
}

/**
 * The endpoint URL discovery itself offers for a service, used when no curated
 * {@link UrlSelector} applies.
 *
 * When the service's `versions` map has exactly one entry, that version's `url`
 * is surfaced: a Repertoire 3.0 service may, like SIA or HiPS, publish its
 * usable endpoint only under `versions`. With zero or several versions the base
 * `url` is surfaced instead, since choosing among several needs curation and
 * the base URL is a reasonable landing point. A lone version without a `url`
 * also degrades to the base URL, so the endpoint is never dropped.
 */
export function discoveryServiceUrl(service: DataService): string {
  const versions = Object.values(service.versions ?? {});
  const soleVersion = versions.length === 1 ? versions[0] : undefined;
  return soleVersion?.url ?? service.url;
}

/**
 * Select the endpoint URL for a discovered service per its curated selector,
 * or per {@link discoveryServiceUrl} when no selector is given.
 *
 * Missing versions degrade to the service's base URL so an unexpected discovery
 * shape never drops the endpoint.
 */
export function selectServiceUrl(
  service: DataService,
  selector?: UrlSelector
): string {
  if (selector === undefined) {
    return discoveryServiceUrl(service);
  }
  if (selector === 'base') {
    return service.url;
  }
  return service.versions?.[selector.versionKey]?.url ?? service.url;
}
