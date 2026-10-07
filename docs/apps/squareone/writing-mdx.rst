######################
Writing content in MDX
######################

Content on Squareone's pages is written in MDX_ files, which are Markdown files enriched with React components.
This page explains how to write MDX_ and what components you can use in your page content.

MDX files
=========

Path structure
--------------

The MDX files are located in a directory specified by the ``mdxDir`` configuration key (defaults to ``src/content/pages`` in development).

MDX files are named after the page path, using ``__`` as a directory separator.
For example, the page at ``/enrollment/pending-approval`` corresponds to the MDX file ``enrollment__pending-approval.mdx``.

An example
----------

Here's an example of a typical MDX file, ``enrollment__pending-confirmation.mdx``:

.. code-block:: markdown
   :caption: enrollment__pending-confirmation.mdx

   # Please confirm your email

   <Lede>Your email is still pending verification.</Lede>

   To complete your enrollment please check the email you registered with
   for a link to verify your email address. Please click on the link to
   verify your email address.

   If you have not received the confirmation email please check your SPAM folder.

   If you still cannot find the confirmation email please
   <Link href="../support">contact us</Link> to have the confirmation
   email resent.

The sections below describe the Markdown syntax and React components you can use in MDX files.

Markdown syntax
===============

MDX uses CommonMark_ for its core Markdown syntax.
See `MDX's Markdown docs <https://mdxjs.com/docs/what-is-mdx/#markdown>`__ for an overview of the Markdown syntax you can use.

.. _mdx-code-blocks:

Code blocks
-----------

Show code, such as a Python example or a configuration snippet, with a fenced code block.
Name the code's language after the opening backticks to highlight its syntax:

.. code-block:: markdown
   :caption: api-aspect.mdx

   ```python
   import pyvo

   tap = pyvo.dal.TAPService("https://data.lsst.cloud/api/tap")
   results = tap.search("SELECT TOP 10 * FROM dp1.Object")
   ```

A fenced code block with a language renders through the ``CodeBlock`` component from Squared, which is the standard for showing code in Squareone (see :doc:`/packages/squared/code-block`).
The block has a button that copies the code, and long lines scroll horizontally.

- **Languages.** Use a language name such as ``python``, ``bash``, ``json``, ``yaml``, ``sql``, ``javascript``, or ``typescript``, or a common alias such as ``py``, ``sh``, ``yml``, or ``ts``.
  See :ref:`code-block-languages` for the full list.
  Code in any other language displays as plain monospace text, still with the copy button.
- **Client-side highlighting.** Highlighting happens in the browser after the page loads, using the `CSS Custom Highlight API`_.
  The server-rendered page, and browsers without that API, show the code as plain monospace text, so the code is always readable.
- **No language.** A fenced code block without a language renders as a plain preformatted block, with no highlighting and no copy button.

React components
================

You can use a limited set of React components in MDX.
Some pages enable additional components; the documentation for those configurations specifies those components.
For example, the ``/docs`` page adds cards and the service-discovery-driven ``<DatasetDocsCards>`` (see :doc:`docs-page`).
The following sections describe the common components that all MDX content can use, including the service-discovery-driven :ref:`ServiceLink <mdx-service-link>`.

.. warning:: Be careful with newlines and React components.

   When wrapping content inside React elements that are paragraph-level tags, don't use newlines like this:

   .. code-block:: markdown
      
      <Lede>
        Here's the first paragraph of the page.
      </Lede>

   The problem is that this created nested ``<p>`` tags: the first is created by the ``<Lede>`` component and the second by markdown because of the newline for the content.

   Instead, do:

   .. code-block:: markdown
      
      <Lede>Here's the first paragraph of the page.</Lede>

   This way the ``<p>`` tag is created only by the ``<Lede>`` element, and not by markdown.

Lede
----

Use this to make a paragraph (generally the first paragraph of a page) larger.

.. code-block:: text

   <Lede>Here's the first paragraph of the page.</Lede>

Link
----

This is the Next.js component for in-app linking. Specify the page's page with the ``href`` prop.

.. code-block:: text

  If you have trouble, <Link href="../support"><a>contact us</a></Link>.

CtaLink
-------

Wraps the content in a call-to-action button. 

.. code-block:: text

   <CtaLink href="https://github.com/rubin-dp0/Support/issues/new/choose">Create a GitHub issue</CtaLink>

.. _mdx-service-link:

ServiceLink
-----------

Links to the URL of a user-facing (UI) service from Repertoire service discovery, so that the same MDX works in every environment without hardcoding each environment's hosts.
Set ``service`` to the service's name under ``services.ui`` in discovery, such as ``comanage`` for the COmanage account settings.

When self-closing, the link text is the service's URL without its trailing slash:

.. code-block:: text
   :caption: settings__index.mdx

   <Lede>Your account settings are available at <ServiceLink service="comanage" />.</Lede>

On idfdev, where discovery lists the ``comanage`` URL as ``https://id-dev.lsst.cloud/``, this renders a link to that URL with the text ``https://id-dev.lsst.cloud``.

Content inside ``<ServiceLink>`` becomes the link text instead:

.. code-block:: text

   Use the menu in the upper right corner of your <ServiceLink service="comanage">account settings</ServiceLink> page.

Set ``variant="cta"`` to render the link as a call-to-action button, like ``<CtaLink>``:

.. code-block:: text

   <ServiceLink service="comanage" variant="cta">Manage account settings</ServiceLink>

When there's no URL to link to, because ``repertoireUrl`` isn't set, the Repertoire API is unavailable, or discovery doesn't list the service, no link renders and the rest of the page renders as usual:

- The content inside ``<ServiceLink>`` renders as plain text.
- A self-closing ``<ServiceLink />`` renders nothing.
  Where a sentence needs to read well without the link, put the link text inside ``<ServiceLink>`` instead.
- A ``variant="cta"`` link renders nothing, not even its content.

Squareone logs a failed discovery request and reports an outage to Sentry.
It logs a warning when discovery doesn't list the service, but only once per server process for each service name, because a misnamed service such as ``service="comange"`` stays wrong on every request until the MDX is fixed.
The warning appears the first time a page with that tag renders after Squareone starts; later requests still render the fallback, but don't log it again.
All the ``<ServiceLink>`` tags on a page share one discovery request.
