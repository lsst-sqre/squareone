######################
Writing content in MDX
######################

Content on Squareone's pages can be customized through :file:`squareone.config.yaml` (via Kubernetes ConfigMap and Helm values).
This content is primarily written in MDX_, which is a Markdown that's enriched with React components.
This page explains how to write MDX_ and what components you can use in your page content.

.. tip::

   In the ``squareone.config.yaml`` configuration file, any field that ends with ``Mdx`` can be written in MDX.
   See :doc:`config-ref` for a listing of fields in the :file:`squareone.config.yaml` file.

An example
==========

Here's an example of a typical MDX-formatted configuration field, ``pendingVerificationPageMdx``:

.. code-block:: yaml
   :caption: squareone.config.yaml

   pendingVerificationPageMdx: |
     # Please confirm your email
   
     <Lede>Your email is still pending verification.</Lede>
   
     To complete your enrollment please check the email you registered with
     for a link to verify your email address. Please click on the link to
     verify your email address.
   
     If you have not received the confirmation email please check your SPAM folder.
   
     If you still cannot find the confirmation email please 
     <Link href="../support"><a>contact us</a></Link> to have the confirmation
     email resent.

Here are some things to notice:

- When writing multi-line markdown in YAML (either directly in :file:`squareone.conf.yaml` or in a Helm values file), it's convenient to use the ``|`` syntax to include a text block while preserving line breaks.
- Standard Markdown syntax is permitted and you're encouraged to use it for headings, links, lists, and so on.
- You can wrap content in React components to for specialized typography and interactivity.

Markdown syntax
===============

MDX uses CommonMark_ for its core Markdown syntax.
See `MDX's Markdown docs <https://mdxjs.com/docs/what-is-mdx/#markdown>`__ for an overview of the Markdown syntax you can use.

React components
================

You can use a limited set of React components in MDX.
Some pages enable additional components; the documentation for those configurations specifies those components.
The following sections describe the common components that all MDX content can use.

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
