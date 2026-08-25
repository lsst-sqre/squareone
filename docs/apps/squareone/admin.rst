##########################
Admin section access
##########################

Squareone's ``/admin`` section collects the operator-facing pages: sending user notifications, managing Gafaelfawr service tokens, managing OpenID Connect clients, and the Sentry tools page.
Each of those pages calls a different API, and each of those APIs is guarded by its own Gafaelfawr scope — scopes that are set per Phalanx environment and are not discoverable at runtime.

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

- The admin sidebar lists only the pages the signed-in user holds a scope for, so nobody is offered a page that would answer ``403``.
- ``/admin`` redirects to the first page in that filtered list. Someone holding only ``admin:oidc`` lands directly on ``/admin/oidc-clients``.
- A user who can reach no admin page at all sees a "No admin pages are available for your account" message instead of a redirect.

Navigation *order* is code-defined and not configurable, so the redirect target for a user who can see several pages follows the order in the sidebar.
Which admin pages exist is likewise fixed by the application: ``adminPageScopes`` controls access to pages, not their presence.

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
