import type { DataService } from '@lsst-sqre/repertoire-client';

/**
 * Which discovery URL to surface for a curated service.
 *
 * - `'base'` uses the service's top-level `url`.
 * - `{ versionKey }` prefers the named version's `url`, falling back to the
 *   base `url` when that version is absent from discovery.
 */
export type UrlSelector = 'base' | { versionKey: string };

/**
 * Editorial presentation for a single discovery service, keyed by the raw
 * service name (e.g. `sia`, `tap`).
 */
export type ServicePresentation = {
  /** Human-facing label shown for the endpoint. */
  label: string;
  /** IVOA standard documentation link the label points to, if any. */
  ivoaUrl?: string;
  /**
   * Short standard/spec acronym used in the doc link's accessible label —
   * e.g. `TAP` renders the book-icon link as "IVOA TAP docs". Pairs with
   * {@link ivoaUrl}.
   */
  ivoaName?: string;
  /** Which discovery URL to surface (defaults to the base `url`). */
  url?: UrlSelector;
};

/**
 * App-local, editorial presentation map layered over Repertoire discovery.
 *
 * This is squareone-local curation — human labels, IVOA standard links, URL
 * selection, and dataset display names — not part of the shared discovery
 * client. Services and dataset keys absent from these maps fall back to their
 * raw discovery values (raw service name + base URL; raw dataset key).
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
 * `hips-list-1.0` `/list` URL; TAP and SODA use their base URLs.
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
    alerts: {
      label: 'Alerts',
      url: 'base',
    },
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
 * Select the endpoint URL for a discovered service per its curated selector.
 *
 * Missing versions degrade to the service's base URL so an unexpected discovery
 * shape never drops the endpoint.
 */
export function selectServiceUrl(
  service: DataService,
  selector: UrlSelector = 'base'
): string {
  if (selector === 'base') {
    return service.url;
  }
  return service.versions?.[selector.versionKey]?.url ?? service.url;
}
