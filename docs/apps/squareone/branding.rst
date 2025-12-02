################################
Branding Squareone deployments
################################

Squareone supports per-deployment customization through YAML configuration files and MDX content.
This page provides an overview of the branding options available.
For complete configuration details, see the :doc:`config-ref`.

Site branding
=============

siteName
--------

The name of your science platform deployment.
This is used in the HTML ``<title>`` tag and displayed prominently in the homepage hero.

.. code-block:: yaml

   siteName: 'Rubin Science Platform'

Default: ``Rubin Science Platform``

siteDescription
---------------

A description of your site, used in the HTML meta description tag.

.. code-block:: yaml

   siteDescription: |
     Welcome to the Rubin Science Platform.

Default: ``Welcome to the Rubin Science Platform``

Header logo
===========

The header logo appears at the top of every page.
Squareone supports three ways to provide a custom logo, with the following priority:

1. **External URL** (``headerLogoUrl``) — highest priority
2. **Base64-encoded data** (``headerLogoData``) — second priority
3. **Default Rubin Observatory logo** — fallback if neither is provided

headerLogoUrl
-------------

An HTTPS URL to an externally-hosted logo image.
This takes precedence over ``headerLogoData`` if both are provided.

.. code-block:: yaml

   headerLogoUrl: 'https://example.com/my-logo.png'
   headerLogoWidth: 200
   headerLogoHeight: 50

.. note::

   When using ``headerLogoUrl``, you should also set ``headerLogoWidth`` to ensure proper sizing.

headerLogoData and headerLogoMimeType
-------------------------------------

For deployments where an external URL is not available, you can embed the logo as base64-encoded data.
This is useful for Kubernetes ConfigMap-based deployments.

.. code-block:: yaml

   headerLogoData: 'iVBORw0KGgoAAAANSUhEUgAAAAUA...'
   headerLogoMimeType: 'image/png'
   headerLogoWidth: 200
   headerLogoHeight: 50

The ``headerLogoMimeType`` is required when using ``headerLogoData``.
Supported MIME types: ``image/png``, ``image/jpeg``, ``image/svg+xml``, ``image/webp``, ``image/gif``.

headerLogoWidth and headerLogoHeight
------------------------------------

Dimensions for the header logo in pixels.

- ``headerLogoHeight``: Default is ``50`` pixels
- ``headerLogoWidth``: Required when using a custom logo URL or data

.. code-block:: yaml

   headerLogoHeight: 50
   headerLogoWidth: 200

headerLogoAlt
-------------

Alternative text for the logo image, important for accessibility.

.. code-block:: yaml

   headerLogoAlt: 'My Organization Logo'

Default: ``Logo``

MDX content customization
=========================

Squareone uses MDX files for customizable content areas.
MDX is Markdown enhanced with React components.

mdxDir
------

The directory where MDX content files are located.
Use a relative path for development or an absolute path for production deployments with ConfigMap mounting.

.. code-block:: yaml

   # Development (relative path)
   mdxDir: 'src/content/pages'

   # Production with ConfigMap (absolute path)
   mdxDir: '/etc/squareone/content'

Default: ``src/content/pages``

Page content
------------

MDX files provide content for various pages in Squareone.
See :doc:`writing-mdx` for details on writing MDX content and available components.

Footer content
--------------

The footer can be customized with MDX content using the ``footerMdxPath`` configuration.
See :doc:`footer-customization` for footer-specific components and examples.

Configuration reference
=======================

For a complete list of all configuration options, see :doc:`config-ref`.
