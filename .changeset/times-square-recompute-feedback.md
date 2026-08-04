---
'squareone': patch
---

Report the computation a Times Square Recompute button starts. Clicking Recompute in the page panel produced no visible response: the panel kept summarizing the previous run ("Computed … in N seconds.") on a page whose HTML is still the old rendering, because a recompute is only observable once the events stream reports the run the soft delete scheduled — several seconds later, after an event interval or two. `ExecStats` now reports the computation from the click onwards, while the soft-delete request is in flight and then until the stream describes a different execution than the one captured at request time (a queued or in-progress run, a new finish time, a new rendering, or a new failure). The status message is announced to assistive technology (`role="status"`). If the request fails, no computation is claimed: the summary and the Recompute button stay put alongside the existing failure message, which is unchanged, as is the Sentry capture tagged `site: times-square-recompute`.

A recompute that the server never reports no longer strands the panel. The requested state falls back to the last reported execution after 30 seconds, so the Recompute button always comes back.

Queued runs are reported instead of rendering nothing. The panel handled `execution_status: 'in_progress'` but fell through `'queued'` to an empty panel, so a run reported as queued — the state a fresh recompute passes through — briefly erased the panel's contents. Both statuses now share the in-progress message, so a recompute reads as one continuous computation. The button is no longer separately disabled while a request is in flight, since the in-progress message replaces it entirely.
