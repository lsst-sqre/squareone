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
      url: { versionKey: 'sia-query-2.0' },
    },
    hips: {
      label: 'HiPS (Hierarchical Progressive Survey)',
      ivoaUrl: 'https://www.ivoa.net/documents/HiPS',
      url: { versionKey: 'hips-list-1.0' },
    },
    tap: {
      label: 'Table Access Protocol (TAP)',
      ivoaUrl: 'https://www.ivoa.net/documents/TAP/',
      url: 'base',
    },
    cutout: {
      label: 'SODA Image Cutouts',
      ivoaUrl: 'https://www.ivoa.net/documents/SODA/20170517/REC-SODA-1.0.html',
      url: 'base',
    },
    datalink: {
      label: 'DataLink',
      url: 'base',
    },
    gms: {
      label: 'Group Membership Service (GMS)',
      url: 'base',
    },
  },
  datasetDisplayNames: {
    dp1: 'Data Preview 1',
    dp02: 'Data Preview 0.2',
    dp03: 'Data Preview 0.3',
    prompt: 'Prompt',
  },
};

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
