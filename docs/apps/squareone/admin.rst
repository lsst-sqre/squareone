##########################
Admin section access
##########################

Squareone's ``/admin`` section collects the operator-facing pages: an overview of the environment, sending user notifications, managing Gafaelfawr service tokens, managing OpenID Connect clients, and the Sentry tools page.
Each of the pages other than the overview calls a different API, and each of those APIs is guarded by its own Gafaelfawr scope — scopes that are set per Phalanx environment and are not discoverable at runtime.

Squareone therefore does not hard-code which scope guards which page.
Instead every admin page has a fixed *page id*, and the ``adminPageScopes`` configuration key maps those ids to the scopes that grant access to them in your environment.

.. code-block:: yaml

   adminPageScopes:
     notifications: ['admin:notifications']
     serviceTokens: ['admin:token']
     oidcClients: ['admin:oidc']
     sentry: ['exec:admin']

The values above are also the defaults, so a deployment that uses Gafaelfawr's standard admin scopes can omit ``adminPageScopes`` entirely — or name only the pages whose scopes it changes, leaving the rest at their defaults.

Page ids
========

The keys are fixed by the application; an unrecognized key fails configuration validation at startup rather than being silently ignored.

.. list-table::
   :header-rows: 1
   :widths: 20 30 50

   * - Page id
     - Route
     - Purpose
   * - ``notifications``
     - ``/admin/notifications``
     - Compose and browse the user notifications sent through Semaphore.
   * - ``serviceTokens``
     - ``/admin/service-tokens``
     - Create, search, and revoke Gafaelfawr service tokens.
   * - ``oidcClients``
     - ``/admin/oidc-clients``
     - Manage Gafaelfawr's OpenID Connect clients.
   * - ``sentry``
     - ``/admin/sentry``
     - Link to the Sentry dashboard and exercise error and log reporting.

How the mapping is applied
==========================

Access is **any-of**: a user may use a page when they hold at least one of the scopes listed for it.
That mapping drives the whole section:

- The header user menu offers an "Admin" link to anyone who can reach at least one admin page.
- The admin sidebar lists only the pages the signed-in user holds a scope for, so nobody is offered a page that would answer ``403``.
  The :ref:`overview <admin-overview>` has no page id and is listed first for everyone who can reach the admin section.
- ``/admin`` is the overview, so the "Admin" link lands there whichever pages the user can reach.
- A user who can reach no admin page at all sees an "Unauthorized" note anywhere under ``/admin``, and no "Admin" link in the user menu.
- Each admin page with a page id gates on its own entry. Someone who arrives at a page directly — from a bookmark, or a link shared by a colleague with different scopes — without a scope that page lists sees an "Unauthorized" note naming the scopes that would have granted access, in place of the page. There is no redirect: the person asked for that page, so the answer is about that page.

There is no single "admin" scope.
``exec:admin`` opens the admin section only because the ``sentry`` page's default scope list happens to name it; point ``sentry`` at another scope and ``exec:admin`` grants nothing on its own.

Navigation *order* is code-defined and not configurable.
Which admin pages exist is likewise fixed by the application: ``adminPageScopes`` controls access to pages, not their presence.

.. _admin-overview:

Overview page
=============

``/admin`` shows an overview of the environment, built from Repertoire service discovery (the ``repertoireUrl`` configuration that the rest of Squareone already uses).
It has these sections:

Environment
   The environment's title, Phalanx label, name, and description, with a link to its Phalanx documentation.
   Under Repertoire 2.x, which publishes only the environment's name, the section shows just that name.

Operator links
   Cards linking to Argo CD, Chronograf, and Kafdrop, each shown only when discovery lists that UI service, with a link to the tool's own documentation when discovery has one.
   They are followed by the environment's Phalanx documentation and the raw discovery document (``/discovery`` under the ``repertoireUrl``).
   The links are not filtered by your scopes, since the admin section is already restricted to administrators.

Applications
   A table of every Phalanx application enabled in the environment, joined to the UI and API services discovery publishes for it: the service title, whether it offers a UI, an API, or both, its URLs, its documentation link, the scopes its services require, and a link to its OpenAPI specification.
   Discovery keys services by service name, which usually matches the application name; a few known exceptions are joined by name in Squareone (``nublado`` also joins ``nublado-controller``, ``datalinker`` joins ``datalink``, and ``vo-cutouts`` joins ``cutout``), and a URL from such a service names the service it came from.
   Applications with no matching service, such as infrastructure like ``cert-manager``, are listed by name only.
   The table sorts by name, title, or kind, and a filter narrows it to the applications whose name or title contains the text you type.

The overview needs no new configuration and no page id in ``adminPageScopes``: it is visible to anyone who passes the admin section's gate, that is, anyone who can reach at least one admin page.
Without a ``repertoireUrl``, the page says that service discovery is not configured; if discovery can't be loaded, it shows a warning with a button to try again.

Hiding a page
=============

Configuring a page with an empty scope list hides it from everyone, which is the supported way to switch a page off in an environment where the underlying service is not deployed:

.. code-block:: yaml

   adminPageScopes:
     oidcClients: []

Relationship to the ingress
===========================

This mapping is a client-side gate.
The authoritative restriction on the ``/admin`` prefix is the Gafaelfawr-authenticated ingress in Squareone's Phalanx chart, which admits users holding any of the admin scopes.
Keep the ingress's scope list and ``adminPageScopes`` in agreement: a scope that ``adminPageScopes`` grants a page but the ingress does not admit leaves the user unable to reach the page at all.
