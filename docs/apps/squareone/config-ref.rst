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

Deprecated keys
===============

``coManageRegistryUrl``
   The COmanage registry URL is available from Repertoire service discovery as the ``services.ui.comanage`` UI service, so Squareone no longer reads this key.
   It is still accepted so that existing configurations continue to validate, and can be removed from them.

``semaphoreUrl``
   The Semaphore URL is resolved from Repertoire service discovery through ``repertoireUrl``, so Squareone no longer reads this key.
   It is still accepted so that existing configurations continue to validate, and can be removed from them.

Schema
======

.. jsonschema:: squareone.config.schema.json
   :lift_description: True
