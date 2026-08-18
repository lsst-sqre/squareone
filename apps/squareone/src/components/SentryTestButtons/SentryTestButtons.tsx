'use client';

import { Button } from '@lsst-sqre/squared';
import * as Sentry from '@sentry/nextjs';
import React, { useState } from 'react';
import { adminFetch } from '@/lib/admin/adminFetch';
import {
  EMIT_LOG_PATH,
  type EmitLogDelivery,
  isEmitLogDelivery,
  SMOKE_TEST_LEVELS,
} from '@/lib/sentry/emitLogSmokeTest';
import styles from './SentryTestButtons.module.css';

/**
 * How alarming a readout is, least to most.
 *
 * The tone is a styling hook: it lets the readout paint a delivered log
 * differently from a gated or undelivered one, so the outcomes are not visually
 * identical. `warning` covers the outcomes that are neither a clean success nor
 * a transport failure — nothing reached Sentry, but nothing is broken either.
 *
 * Every member is a real outcome of a real attempt; there is no "nothing has
 * happened yet" member, because that state is the absence of a status rather
 * than a status of its own. It renders as no `data-tone` attribute at all.
 */
const TONE_SEVERITY = ['success', 'pending', 'warning', 'failure'] as const;

type EmitLogTone = (typeof TONE_SEVERITY)[number];

/** Status of the most recent "Emit server log" attempt. */
type EmitLogStatus = {
  message: string;
  tone: EmitLogTone;
};

/** A sentence of the readout, plus how alarming the fact it reports is. */
type Finding = {
  sentence: string;
  tone: EmitLogTone;
};

/** The emit-log route's report, as read out of the response body. */
type EmitLogReport = {
  delivery: EmitLogDelivery;
  /** Levels that actually produced a pino record (pino gates the rest). */
  emitted: string[];
  /** Search term for the Sentry Logs UI, when the route supplied one. */
  marker: string | null;
};

/** The more alarming of two tones. */
function worstTone(a: EmitLogTone, b: EmitLogTone): EmitLogTone {
  return TONE_SEVERITY.indexOf(a) >= TONE_SEVERITY.indexOf(b) ? a : b;
}

/**
 * Parse an emit-log response body, or `null` if it isn't one.
 *
 * A body that fails these checks did not come from the route handler — a proxy
 * interstitial, or a cached older build — so the caller reports the bare HTTP
 * outcome instead of inventing a delivery verdict from it.
 */
function readEmitLogReport(body: unknown): EmitLogReport | null {
  if (body === null || typeof body !== 'object') return null;
  const { delivery, emitted, marker } = body as {
    delivery?: unknown;
    emitted?: unknown;
    marker?: unknown;
  };
  if (!isEmitLogDelivery(delivery)) return null;
  if (
    !Array.isArray(emitted) ||
    !emitted.every((level) => typeof level === 'string')
  ) {
    return null;
  }
  return {
    delivery,
    emitted: emitted as string[],
    marker: typeof marker === 'string' ? marker : null,
  };
}

/** Read a response body as JSON, or `null` if it isn't JSON at all. */
async function readJsonBody(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    // Not JSON (or a truncated body).
    return null;
  }
}

/** Join level names for prose: `warn`, `warn and error`, `a, b and c`. */
function formatLevels(levels: readonly string[]): string {
  if (levels.length < 2) return levels.join('');
  return `${levels.slice(0, -1).join(', ')} and ${levels[levels.length - 1]}`;
}

/**
 * Report which levels pino actually recorded.
 *
 * A level below the server's `LOG_LEVEL` is noop'd at logger construction time,
 * so a 200 can mean "nothing was written". That is a warning, not a success:
 * the transport was never exercised for the missing levels.
 */
function describeEmission(emitted: string[]): Finding {
  const gated = SMOKE_TEST_LEVELS.filter((level) => !emitted.includes(level));
  if (gated.length === 0) {
    return {
      sentence: `Emitted ${formatLevels(emitted)} records.`,
      tone: 'success',
    };
  }
  if (emitted.length === 0) {
    return {
      sentence: `Emitted nothing — the server log level gated ${formatLevels(
        gated
      )}.`,
      tone: 'warning',
    };
  }
  return {
    sentence: `Emitted ${formatLevels(
      emitted
    )}; the server log level gated ${formatLevels(gated)}.`,
    tone: 'warning',
  };
}

/**
 * Report what became of the records on the way to Sentry.
 *
 * The marker search hint appears only when something was actually delivered:
 * pointing an operator at Sentry Logs for a record that timed out, never left a
 * DSN-less pod, or was never written is precisely the false success this readout
 * has to avoid.
 */
function describeDelivery(report: EmitLogReport, status: number): Finding {
  switch (report.delivery) {
    case 'delivered': {
      if (report.emitted.length === 0) {
        return {
          sentence: `Sentry had nothing to receive (HTTP ${status}).`,
          tone: 'success',
        };
      }
      const hint = report.marker
        ? ` Search Sentry Logs for “${report.marker}”.`
        : '';
      return {
        sentence: `Sentry accepted the flush (HTTP ${status}).${hint}`,
        tone: 'success',
      };
    }
    case 'flush-timeout':
      return {
        sentence: `The Sentry flush timed out, so the records may not have reached Sentry Logs (HTTP ${status}).`,
        tone: 'failure',
      };
    case 'sentry-disabled':
      return {
        sentence: `Sentry is disabled here (no DSN), so the records only went to the server log (HTTP ${status}).`,
        tone: 'warning',
      };
  }
}

/** Turn an emit-log response into the message and tone shown in the readout. */
function describeEmitLog(response: Response, body: unknown): EmitLogStatus {
  const report = readEmitLogReport(body);

  // Without a recognizable report there is nothing to go on but the status
  // code. A delivered log must not be reported as a failure, so a 2xx still
  // reads as success — just without any claim about Sentry.
  if (report === null) {
    return response.ok
      ? {
          message: `Emitted server log (HTTP ${response.status})`,
          tone: 'success',
        }
      : {
          message: `Failed to emit server log (HTTP ${response.status})`,
          tone: 'failure',
        };
  }

  const emission = describeEmission(report.emitted);
  const delivery = describeDelivery(report, response.status);
  return {
    message: `${emission.sentence} ${delivery.sentence}`,
    tone: worstTone(emission.tone, delivery.tone),
  };
}

/**
 * Buttons that exercise the Sentry error-reporting pipeline from the
 * `/admin/sentry` page.
 *
 * - "Throw uncaught error" throws during render (via a state flag) so the App
 *   Router error boundary (`app/error.tsx`) catches it and reports it to
 *   Sentry. Errors thrown directly in an event handler bypass React error
 *   boundaries, so the throw is deferred to the next render instead.
 * - "Capture handled exception" reports a handled exception with
 *   `Sentry.captureException` without interrupting the page.
 * - "Emit server log" POSTs to `/admin/sentry/emit-log`, whose route handler
 *   emits server-side pino warn/error records. The `Sentry.pinoIntegration()`
 *   bridge ships those to Sentry Logs (not issues), so this verifies the
 *   pino→Sentry Logs transport in the server build. The button is held in
 *   `loading` state for exactly as long as the readout's tone is `pending`, so
 *   concurrent requests can't race each other's status updates.
 *
 * The outcome of the "Emit server log" round trip is reported in a status
 * readout that is always mounted (see the `<output>` below), so assistive tech
 * observes the live region before its first message rather than at the same
 * moment. The readout reports the route's own delivery verdict rather than
 * inferring success from the HTTP status, because a smoke test that claims
 * delivery it cannot vouch for is worse than no smoke test.
 *
 * That readout is also the only live region in play: squared's Button keeps its
 * loading spinner out of the accessibility tree and signals the in-flight state
 * with `aria-busy` instead, so one click yields one announcement rather than a
 * spinner and a readout talking over each other about the same action.
 */
export default function SentryTestButtons() {
  const [shouldThrow, setShouldThrow] = useState(false);
  const [emitLogStatus, setEmitLogStatus] = useState<EmitLogStatus | null>(
    null
  );
  // Derived, not stored: the request is in flight exactly while the readout
  // reports it as pending. A second `useState` would be a duplicate of this
  // fact that some later edit could update without updating the readout —
  // a button spinning over a settled message, or the reverse.
  const isEmittingLog = emitLogStatus?.tone === 'pending';

  if (shouldThrow) {
    throw new Error('Sentry Test Error');
  }

  const handleEmitLog = async () => {
    setEmitLogStatus({ message: 'Emitting…', tone: 'pending' });
    try {
      // Every call to an /admin route handler goes through `adminFetch`, which
      // flags it for the Gafaelfawr ingress; see that module for why an
      // unflagged one reports an expired session as a transport failure.
      const response = await adminFetch(EMIT_LOG_PATH, { method: 'POST' });
      // The body carries the delivery verdict even on a non-2xx (a flush
      // timeout and a DSN-less deployment both answer 503), so it is read
      // before the status code is judged.
      setEmitLogStatus(describeEmitLog(response, await readJsonBody(response)));
    } catch (error) {
      setEmitLogStatus({
        message: `Failed to emit server log: ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
        tone: 'failure',
      });
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.buttons}>
        <Button
          type="button"
          tone="danger"
          onClick={() => setShouldThrow(true)}
        >
          Throw uncaught error
        </Button>
        <Button
          type="button"
          appearance="outline"
          onClick={() =>
            Sentry.captureException(new Error('Sentry Test Error (handled)'))
          }
        >
          Capture handled exception
        </Button>
        <Button
          type="button"
          appearance="outline"
          loading={isEmittingLog}
          onClick={() => {
            void handleEmitLog();
          }}
        >
          Emit server log
        </Button>
      </div>
      {/* Mounted unconditionally (and empty until there is something to say)
          so the live region exists before its first message, and kept outside
          the button row so it lays out as its own block rather than stretching
          as a flex sibling of the buttons.

          This is an <output>, where ExecStats and BroadcastBannerStack spell
          the same live region as `role="status"` on a p/div. That is one
          convention, not two:
          <output>'s implicit ARIA role *is* `status`, so all three announce
          identically and the choice only states intent. Per spec <output>
          "represents the result of a calculation performed by the application,
          or the result of a user action" — which is precisely this readout: the
          operator pressed a button on this page and this is what came back. The
          other two are neither; ExecStats reports a background notebook run
          nobody necessarily started from that panel, and BroadcastBannerStack
          is a general container for server-pushed banners. Hence the rule: the
          result of a user action on this page gets <output>, every other polite
          region gets `role="status"`. */}
      <output
        className={styles.status}
        data-tone={emitLogStatus?.tone}
        aria-live="polite"
        aria-atomic="true"
      >
        {emitLogStatus?.message}
      </output>
    </div>
  );
}
