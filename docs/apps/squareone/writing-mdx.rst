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
