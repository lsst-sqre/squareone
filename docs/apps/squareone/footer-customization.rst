######################
Customizing the footer
######################

The footer content in Squareone can be customized using MDX files, similar to page content.
This page explains how to configure the footer and what components are available.
For general information about writing MDX content, see :doc:`writing-mdx`.

Configuration
=============

footerMdxPath
-------------

The ``footerMdxPath`` configuration key specifies the path to the footer MDX file, relative to the ``mdxDir`` directory.

.. code-block:: yaml
   :caption: squareone.config.yaml

   mdxDir: src/content/pages
   footerMdxPath: footer.mdx

The default value is ``footer.mdx``.
If the file is not found, Squareone falls back to a hardcoded default footer with Rubin Observatory branding.

Footer components
=================

In addition to the common MDX components described in :doc:`writing-mdx`, footer MDX files have access to specialized components for footer layout.

FooterNav
---------

A styled navigation container for footer links.
Use this to wrap navigation links that appear at the top of the footer.

.. code-block:: markdown

   <FooterNav>
     <Link href="/terms">Acceptable use policy</Link>
   </FooterNav>

You can include multiple links:

.. code-block:: markdown

   <FooterNav>
     <Link href="/terms">Acceptable use policy</Link>
     <Link href="/support">Support</Link>
   </FooterNav>

FundingNotice
-------------

A container for funding acknowledgments, legal notices, and other fine-print text.
Content inside ``FundingNotice`` is styled with a smaller font size.

.. code-block:: markdown

   <FundingNotice>

   First paragraph of funding acknowledgment text with [inline links](https://example.com).

   Second paragraph continues here.

   </FundingNotice>

Note that blank lines between paragraphs create separate ``<p>`` elements, which is the intended behavior for multi-paragraph notices.

PartnerLogos
------------

Displays partner organization logos.
By default, this shows the Rubin Observatory partner logos (NSF, DOE, NOIRLab, AURA, SLAC).

.. code-block:: markdown

   <PartnerLogos alt="Logos of partner organizations." />

The ``alt`` prop provides alternative text for accessibility.
You can optionally provide a custom image with the ``src`` prop:

.. code-block:: markdown

   <PartnerLogos src="/path/to/custom-logos.png" alt="Custom partner logos." />

Link
----

The ``Link`` component is available for internal navigation links.
See :doc:`writing-mdx` for details on using this component.

Example footer MDX
==================

Here is a complete example of a footer MDX file:

.. code-block:: markdown
   :caption: footer.mdx

   {/* Custom footer content */}
   {/* Available components: FooterNav, FundingNotice, PartnerLogos, Link */}

   <FooterNav>
     <Link href="/terms">Acceptable use policy</Link>
   </FooterNav>

   <FundingNotice>

   The U.S. National Science Foundation ([NSF](https://www.nsf.gov/)) and the U.S. Department of Energy ([DOE](https://www.energy.gov/)) Office of Science will support Rubin Observatory in its operations phase to carry out the Legacy Survey of Space and Time.

   NSF is an independent federal agency created by Congress in 1950 to promote the progress of science.

   </FundingNotice>

   <PartnerLogos alt="Logos of the Vera C. Rubin Observatory, NSF, US DOE, NOIRLab, AURA, and SLAC." />

This example demonstrates:

- **Comments**: Use ``{/* comment */}`` syntax for MDX comments.
- **FooterNav**: Contains navigation links using the ``Link`` component.
- **FundingNotice**: Multi-paragraph funding text with inline Markdown links.
- **PartnerLogos**: Partner logo display with descriptive alt text.
