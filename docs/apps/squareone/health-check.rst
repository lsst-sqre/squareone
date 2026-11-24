#####################
Health check endpoint
#####################

Squareone serves a health check at ``GET /api/health``.
It is the intended target for the Kubernetes liveness and readiness probes on the Squareone deployment.

What it returns
===============

The endpoint always answers ``200 OK`` with a small JSON body that identifies the running build:

.. code-block:: console

   $ curl -i http://localhost:3000/api/health
   HTTP/1.1 200 OK
   cache-control: no-store
   content-type: application/json

   {"status":"ok","version":"0.41.4","revision":"e595c54ab9bc504854d344bec9b4b3484a4466aa"}

``status``
   Always ``"ok"``.
   A response at all means the Squareone process is serving requests.

``version``
   The container image's primary tag, which the Dockerfile sets as the ``SQUAREONE_VERSION`` environment variable: the release version for release images, or the branch-derived tag (such as ``tickets-DM-12345``) for branch builds.
   Outside a container, such as with ``pnpm dev``, it falls back to the version in :file:`apps/squareone/package.json`.

``revision``
   The git commit SHA the image was built from, which the Dockerfile sets as ``SENTRY_RELEASE``.
   It is ``null`` when that variable is unset, as it is with ``pnpm dev``.

These are the same values that every page publishes in its ``squareone:version`` and ``squareone:revision`` meta tags.

The response carries ``Cache-Control: no-store``, and the route is rendered on every request rather than at build time, so a probe never sees a cached answer.

The endpoint needs no authentication.
It is reachable through the same ingress as the rest of Squareone, and it publishes nothing that the meta tags on the home page do not already show.

What it deliberately does not check
===================================

The health check is shallow by design.
It does not call Repertoire, Semaphore, Gafaelfawr or any other service, and it does not read the Squareone YAML configuration.
It can only fail if the Squareone process itself has stopped serving requests.

This matters because of what the probes do with a failure.
A failed liveness probe restarts the pod, but a restart never fixes a problem with another service.
The only upstream state Squareone keeps between page renders is about Repertoire service discovery: the last discovery document it received, which it keeps serving while Repertoire is unavailable, and, for 5 seconds after a discovery request times out, a note to fail further discovery requests at once instead of waiting again.
A restart only throws that away, and probing a path that depends on another service would turn an upstream outage into a Squareone restart loop.

Probing the home page (``/``) has exactly that problem.
Every render of ``/`` makes several outbound requests, to Repertoire for service discovery, to Semaphore for broadcasts and to Gafaelfawr for the user's identity and scopes, so each probe would make those requests too, and a slow or reset connection to any of them could fail the probe.
``/api/health`` makes none of them.

Sentry tracing
==============

Requests to ``/api/health`` are never traced in Sentry, whatever ``SENTRY_TRACES_SAMPLE_RATE`` is set to.
The probes call the endpoint every few seconds, so in an environment that traces every request (a sample rate of ``1``), each probe would otherwise become a Sentry transaction.

Every other request is sampled as before: at ``SENTRY_TRACES_SAMPLE_RATE``, or following the sampling decision of the upstream service when the request continues a trace.
The exclusion applies to tracing only, so errors are still reported to Sentry.

Configuring the probes
======================

In the Phalanx_ chart, point both probes at the health check:

.. code-block:: yaml
   :caption: applications/squareone/templates/deployment.yaml

   livenessProbe:
     httpGet:
       path: /api/health
       port: http
   readinessProbe:
     httpGet:
       path: /api/health
       port: http

.. important::

   Only switch the probes to ``/api/health`` once the chart's ``appVersion`` points at a Squareone release that includes the endpoint.
   An older image answers ``404`` on that path, which fails both probes and keeps the pods restarting.
