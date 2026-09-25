#######################
Configuration reference
#######################

Squareone is configured at runtime through a YAML configuration file.
The path for this configuration file is set by the ``SQUAREONE_CONFIG_PATH`` environment variable in production, and defaults to ``squareone.config.yaml`` in development.
This page documents the schema of that configuration file.

.. _config-discovery-defaults:

Defaults from service discovery
===============================

``siteName``, ``environmentName``, and ``baseUrl`` are optional.
When one is omitted (or set to an empty string), Squareone fills it in at request time from Repertoire service discovery, so these keys no longer need to be set for each Phalanx environment.
An explicitly configured value always takes precedence.

.. list-table::
   :header-rows: 1
   :widths: 20 40 40

   * - Key
     - Default from service discovery
     - Fallback
   * - ``siteName``
     - ``environment.title`` (for example, ``US Rubin Science Platform``)
     - ``Rubin Science Platform``
   * - ``environmentName``
     - ``environment.label``, the Phalanx environment name (for example, ``idfprod``)
     - ``unknown``
   * - ``baseUrl``
     - ``services.ui.squareone.url``, with the trailing slash removed (for example, ``https://data.lsst.cloud``)
     - The origin of the request, from its ``X-Forwarded-Proto`` (default ``http``), ``X-Forwarded-Host``, and ``Host`` headers

Service discovery is only consulted when ``repertoireUrl`` is set and at least one of these keys is omitted.
The fallback applies when ``repertoireUrl`` is unset, when the Repertoire API is unavailable (Squareone logs a warning but still serves pages), or when the Repertoire release predates 3.0.0 and so does not provide the ``environment`` metadata or the ``squareone`` UI service.

The resolved values are used everywhere the keys are: page titles, the Sentry environment and base URL (shown on the ``/admin/sentry`` page), and absolute URLs such as notification permalinks.

Server-side Sentry follows the same ``environmentName`` resolution, so events from the server and the browser carry the same Sentry environment.
The server resolves it once at startup, before it serves any requests: it waits at most a few seconds for service discovery, and if the Repertoire API doesn't respond in time it logs a warning and uses the ``unknown`` fallback.
The server no longer reads the ``SQUAREONE_ENVIRONMENT_NAME`` environment variable.

.. _config-apps-menu:

Apps menu
=========

Setting ``enableAppsMenu`` to ``true`` adds an Apps menu to the header.
Its items are derived from Repertoire service discovery and the user's scopes, so they don't need to be listed for each Phalanx environment:

#. **Times Square** (``/times-square/``), when the ``times-square`` application is enabled.
#. Each of the following UI services that discovery lists and that the user can access, labelled by the service's discovery ``title`` (or its name, if it has no title), in this order:

   .. list-table::
      :header-rows: 1
      :widths: 30 70

      * - Service
        - Associated scopes
      * - ``argocd``
        - ``exec:admin``
      * - ``chronograf``
        - ``exec:admin``
      * - ``kafdrop``
        - ``exec:internal-tools``
      * - ``webdav``
        - ``write:files``

   A service's ``required_scopes`` from discovery (Repertoire 3.0.0 and later) decide who can access it.
   When discovery declares none, as for Argo CD and Chronograf, which have their own logins, the user needs the associated scopes above instead, so that these tools are not advertised to every user.
   These items appear only once the user's scopes are known: anonymous visitors don't see them.

#. The configured ``appLinks``.

``appLinks`` are additive extras for apps that service discovery does not describe (for example, a deployment-specific tool).
They are shown to every user, regardless of scopes.
A link whose ``href`` repeats an earlier item is dropped; relative hrefs are resolved against the ``squareone`` UI service URL and trailing slashes are ignored when comparing, so an ``appLinks`` entry of ``/argo-cd/`` does not duplicate the discovered Argo CD item.
Links for services now derived from discovery can be removed from ``appLinks``, though an entry that stays is still shown to users who can't see the discovered item.

The menu is hidden when it has no items.
When ``repertoireUrl`` is not set, the menu lists only the ``appLinks``.

.. _config-dataset-docs-cards:

Dataset documentation cards
===========================

When ``repertoireUrl`` is set, the ``/docs`` page's ``docs.mdx`` can list the datasets from Repertoire service discovery with the ``<DatasetDocsCards>`` component instead of hand-written cards.
Each card shows the dataset's name and discovery ``description``, and links to its discovery ``docs_url`` when it has one.
When ``repertoireUrl`` is not set, the component renders nothing.
See :ref:`docs-page-dataset-cards`.

.. _config-service-links:

Service links
=============

When ``repertoireUrl`` is set, any page's MDX can link to a UI service's URL from Repertoire service discovery with the ``<ServiceLink service="…">`` component, instead of hardcoding each environment's host.
For example, ``settings__index.mdx`` can link to the COmanage account settings with ``<ServiceLink service="comanage" />``.
When ``repertoireUrl`` is not set, no link renders.
See :ref:`mdx-service-link`.

Deprecated keys
===============

``coManageRegistryUrl``
   The COmanage registry URL is available from Repertoire service discovery as the ``services.ui.comanage`` UI service, so Squareone no longer reads this key.
   To link to it from MDX content, use ``<ServiceLink service="comanage" />`` (see :ref:`config-service-links`).
   It is still accepted so that existing configurations continue to validate, and can be removed from them.

``semaphoreUrl``
   The Semaphore URL is resolved from Repertoire service discovery through ``repertoireUrl``, so Squareone no longer reads this key.
   It is still accepted so that existing configurations continue to validate, and can be removed from them.

Schema
======

.. jsonschema:: squareone.config.schema.json
   :lift_description: True
