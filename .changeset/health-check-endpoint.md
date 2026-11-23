---
'squareone': minor
---

Add a health check endpoint at `GET /api/health`

The endpoint answers `200` with `{"status": "ok", "version": ..., "revision": ...}`, the same build identity that the `squareone:version` and `squareone:revision` meta tags publish, and sends `Cache-Control: no-store`. It is intended as the target of the Kubernetes liveness and readiness probes.

The check is deliberately shallow: it makes no requests to Repertoire, Semaphore or Gafaelfawr and does not read the app configuration, so it fails only when the Squareone process itself stops serving. Probing `/` instead server-renders the home page, which makes several upstream requests on every probe, so a slow or reset connection to another service could fail the probe and restart a healthy pod. Switch the Phalanx probes to `/api/health` only after deploying a Squareone release that includes it.
