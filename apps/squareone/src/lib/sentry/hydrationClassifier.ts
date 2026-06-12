// Pure, DOM-free classifier that separates browser-extension hydration noise
// from genuine in-app React hydration mismatches.
//
// This is a "deep module": a small, dependency-light surface (three exports)
// hiding the heuristics for recognising React's recoverable hydration errors
// and the DOM signatures left behind by common browser extensions. It performs
// NO DOM access of its own — callers pass an attribute-name snapshot — so it is
// trivially unit-testable and safe to run in any environment.
//
// Conservatism is the guiding principle: an event is only ever labelled
// `extension` when it is BOTH a recognised hydration error AND a known
// extension marker is present in the snapshot. A genuine in-app mismatch on a
// clean DOM is never hidden.

import type { Event } from '@sentry/nextjs';

/**
 * The classification buckets a hydration-relevant event can fall into.
 *
 * - `extension`: a hydration error with a known browser-extension DOM marker
 *   present — almost certainly noise outside our control.
 * - `in-app`: a hydration error with a clean DOM snapshot — treated as a
 *   genuine mismatch and kept at full severity.
 * - `unknown`: not a recognised hydration error (the classifier does not
 *   apply).
 */
export type HydrationClassification = 'extension' | 'in-app' | 'unknown';

/** A browser-extension DOM signature, matched by attribute-name prefix. */
export type ExtensionMarker = {
  /** Stable identifier reported in `markers` and event context. */
  id: string;
  /**
   * Lower-cased attribute-name prefixes that signal this extension. Prefixes
   * (rather than exact names) absorb the per-instance suffixes extensions add
   * (e.g. Grammarly's `data-gr-ext-installed`, `data-gr-c-s-loaded`).
   */
  attrPrefixes: string[];
};

export type ClassifyHydrationEventInput = {
  /** The Sentry event under consideration. */
  event: Event | undefined | null;
  /** Attribute names snapshotted from `document.body`. */
  bodyAttrs?: string[];
  /** Attribute names snapshotted from `document.documentElement`. */
  htmlAttrs?: string[];
};

export type HydrationClassificationResult = {
  classification: HydrationClassification;
  /** IDs of the extension markers matched in the supplied snapshot. */
  markers: string[];
};

/**
 * In-code list of browser-extension DOM signatures. Kept as a const (not
 * runtime-configurable, per the PRD) and matched case-insensitively by
 * attribute-name prefix.
 */
export const KNOWN_EXTENSION_MARKERS: ExtensionMarker[] = [
  // Grammarly injects data-gr-* and data-new-gr-c-s-* onto <body>.
  { id: 'grammarly', attrPrefixes: ['data-gr-', 'data-new-gr-c-s-'] },
  // Dark Reader rewrites styles and stamps the root/body with data-darkreader-*.
  { id: 'darkreader', attrPrefixes: ['data-darkreader-'] },
  // LastPass password manager.
  { id: 'lastpass', attrPrefixes: ['data-lastpass-', 'data-lp-'] },
  // 1Password.
  { id: '1password', attrPrefixes: ['data-1p-', 'data-1password-'] },
  // Dashlane.
  { id: 'dashlane', attrPrefixes: ['data-dashlane', 'data-kwimpalastatus'] },
  // Bitwarden.
  { id: 'bitwarden', attrPrefixes: ['data-bitwarden-', 'data-bw-'] },
  // LanguageTool grammar checker.
  { id: 'languagetool', attrPrefixes: ['data-lt-installed', 'data-lt-'] },
  // ColorZilla / other a11y or contrast extensions stamp the body too; cover
  // the common "cz-shortcut-listen" sentinel.
  { id: 'colorzilla', attrPrefixes: ['cz-shortcut-listen'] },
];

// Minified React error codes corresponding to hydration / recoverable
// hydration failures.
const HYDRATION_ERROR_CODES = [418, 419, 421, 422, 423, 425];

// Lower-cased substrings that identify a hydration mismatch from the
// human-readable error text (dev builds and some recoverable-error messages).
const HYDRATION_MESSAGE_PATTERNS = [
  'hydration failed',
  "didn't match",
  'did not match',
  'error while hydrating',
  'text content does not match',
  'hydrating but react',
];

/**
 * Gather the searchable text from a Sentry event (top-level message plus every
 * exception type/value), lower-cased and joined, for substring matching.
 */
const collectEventText = (event: Event | undefined | null): string => {
  if (!event) {
    return '';
  }
  const parts: string[] = [];
  if (typeof event.message === 'string') {
    parts.push(event.message);
  }
  const values = event.exception?.values;
  if (Array.isArray(values)) {
    for (const value of values) {
      if (value?.type) {
        parts.push(value.type);
      }
      if (value?.value) {
        parts.push(value.value);
      }
    }
  }
  return parts.join('\n').toLowerCase();
};

/**
 * Detect a React hydration recoverable error from a Sentry event. Matches both
 * minified error codes (418/419/421/422/423/425, via the bundled error URL)
 * and the human-readable hydration-mismatch message patterns.
 */
export const isHydrationError = (event: Event | undefined | null): boolean => {
  const text = collectEventText(event);
  if (!text) {
    return false;
  }
  for (const code of HYDRATION_ERROR_CODES) {
    if (
      text.includes(`react error #${code}`) ||
      text.includes(`/errors/${code}`) ||
      text.includes(`invariant=${code}`)
    ) {
      return true;
    }
  }
  return HYDRATION_MESSAGE_PATTERNS.some((pattern) => text.includes(pattern));
};

/**
 * Match the supplied attribute names against KNOWN_EXTENSION_MARKERS, returning
 * the deduplicated IDs of every marker present. Defensive against non-string
 * entries and undefined input.
 */
const matchMarkers = (attrNames: string[]): string[] => {
  const matched = new Set<string>();
  for (const raw of attrNames) {
    if (typeof raw !== 'string') {
      continue;
    }
    const name = raw.toLowerCase();
    for (const marker of KNOWN_EXTENSION_MARKERS) {
      if (marker.attrPrefixes.some((prefix) => name.startsWith(prefix))) {
        matched.add(marker.id);
      }
    }
  }
  return Array.from(matched);
};

/**
 * Conservatively classify a (possibly hydration-related) Sentry event given a
 * snapshot of the `<body>` and `<html>` attribute names.
 *
 * - Not a hydration error → `unknown` (the classifier does not apply, even if
 *   extension markers happen to be present).
 * - Hydration error + known extension marker → `extension`.
 * - Hydration error + clean DOM → `in-app` (kept loud).
 */
export const classifyHydrationEvent = ({
  event,
  bodyAttrs,
  htmlAttrs,
}: ClassifyHydrationEventInput): HydrationClassificationResult => {
  const attrNames = [
    ...(Array.isArray(bodyAttrs) ? bodyAttrs : []),
    ...(Array.isArray(htmlAttrs) ? htmlAttrs : []),
  ];
  const markers = matchMarkers(attrNames);

  if (!isHydrationError(event)) {
    return { classification: 'unknown', markers };
  }
  if (markers.length > 0) {
    return { classification: 'extension', markers };
  }
  return { classification: 'in-app', markers };
};
