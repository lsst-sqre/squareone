// Client-side Sentry `beforeSend` hook wired into `instrumentation-client.js`.
//
// It snapshots the `<body>` / `<html>` attribute names, hands that DOM-free
// snapshot to the pure `classifyHydrationEvent` classifier, and folds the
// result back into the outgoing event in a single pass:
//
//   - `extension` → tag `hydration.classification=extension`, set a custom
//     fingerprint so all extension noise collapses into ONE separate, mutable
//     Sentry issue, and attach the matched markers + body-attribute fingerprint
//     as diagnostic context. The event is KEPT, never dropped — we regroup, not
//     suppress, to preserve an audit trail.
//   - `in-app` / `unknown` → set the classification tag and attach the same
//     context, but leave grouping and severity untouched so a genuine
//     regression stays loud.
//
// Defensive by construction: a `document`/`window` guard plus a top-level
// try/catch guarantee the event is always returned unchanged on any internal
// error, so no event is ever silently lost.

import type { ErrorEvent } from '@sentry/nextjs';
import { classifyHydrationEvent } from './hydrationClassifier';

/**
 * Custom fingerprint that collapses every extension-classified hydration event
 * into a single, separately mutable Sentry issue.
 */
export const EXTENSION_NOISE_FINGERPRINT = ['hydration-extension-noise'];

/** Read an element's attribute names defensively (never throws on its own). */
const snapshotAttributeNames = (el: Element | null | undefined): string[] => {
  if (!el || typeof el.getAttributeNames !== 'function') {
    return [];
  }
  return el.getAttributeNames();
};

/** Compact, stable representation of a DOM element's attribute-name set. */
const fingerprintAttributes = (attrNames: string[]): string =>
  [...attrNames].sort().join(',');

/**
 * Sentry `beforeSend` callback: classify hydration events, tag + enrich them,
 * and regroup extension noise — always returning the (possibly mutated) event.
 */
export const beforeSend = (event: ErrorEvent): ErrorEvent => {
  try {
    if (typeof document === 'undefined' || typeof window === 'undefined') {
      return event;
    }

    const bodyAttrs = snapshotAttributeNames(document.body);
    const htmlAttrs = snapshotAttributeNames(document.documentElement);
    const { classification, markers } = classifyHydrationEvent({
      event,
      bodyAttrs,
      htmlAttrs,
    });

    event.tags = {
      ...event.tags,
      'hydration.classification': classification,
    };
    event.contexts = {
      ...event.contexts,
      hydration: {
        classification,
        markers,
        bodyAttributeFingerprint: fingerprintAttributes(bodyAttrs),
        bodyAttrs,
        htmlAttrs,
      },
    };

    if (classification === 'extension') {
      event.fingerprint = [...EXTENSION_NOISE_FINGERPRINT];
    }

    return event;
  } catch {
    // Never let classification cost us an event — return it untouched.
    return event;
  }
};

export default beforeSend;
