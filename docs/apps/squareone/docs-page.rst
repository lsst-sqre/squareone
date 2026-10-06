##################
Documentation page
##################

The ``/docs`` page's content is :doc:`written in MDX <writing-mdx>` and loaded from the ``docs.mdx`` file in the ``mdxDir`` directory.
In Phalanx, each environment supplies its own ``docs.mdx`` in the Squareone application's ``content/<environment>/`` directory, which is mounted into ``mdxDir``.
The ``docs.mdx`` in the Squareone repository (``src/content/pages/docs.mdx``) is the development and default content.

Components
==========

In addition to the common components described in :doc:`writing-mdx`, ``docs.mdx`` can use these components:

``<Section>``
   Groups a section heading with its content and spaces it from the previous section.

``<CardGroup>`` and ``<Card>``
   A responsive grid of documentation cards.
   Wrap a ``<Card>`` in a link (``<a href="…">``) to make the whole card a link.

``<Note>``
   A callout. Set ``type`` to ``note`` (default), ``warning``, ``tip``, or ``info``.

``<DatasetDocsCards>``
   Cards for the datasets from Repertoire service discovery.
   See :ref:`docs-page-dataset-cards`.

.. _docs-page-dataset-cards:

Dataset documentation cards
===========================

The ``<DatasetDocsCards>`` component renders a card for each dataset that Repertoire service discovery lists, so you don't need to update a hand-written card for each environment when datasets change.
Each card shows:

- The dataset's name, such as "Data Preview 1" for ``dp1``, "Data Preview 0.2" for ``dp02``, or "Prompt Products" for ``prompt``.
  A dataset that Squareone doesn't have a name for shows its discovery key, such as ``dr1``.
- The dataset's discovery ``description``.
- A link to the dataset's discovery ``docs_url``, which makes the whole card a link.
  A dataset without a ``docs_url`` gets a card with no link.

The cards are ordered with the newest data release first, followed by the data previews from newest to oldest.
Prompt Products is always the second card.
Datasets that aren't data releases or data previews come last, in the order that discovery lists them.

Put the section heading inside the component, so that the heading is left out along with the cards when there are none:

.. code-block:: text
   :caption: docs.mdx

   <Section>
       <DatasetDocsCards>
       ## Data previews
       </DatasetDocsCards>
   </Section>

Content inside ``<DatasetDocsCards>`` renders above the cards.
The dataset names on the cards are level 3 headings (``<h3>``), to follow a level 2 section heading.
Set ``headingLevel`` to change the level, for example ``<DatasetDocsCards headingLevel={4}>`` under a level 3 heading.

How the cards depend on service discovery:

- When ``repertoireUrl`` isn't set, or discovery lists no datasets, nothing renders, including the content inside ``<DatasetDocsCards>``.
  The rest of the page renders as usual.
- When the Repertoire API is unavailable, the content inside ``<DatasetDocsCards>`` renders with a brief notice that the dataset documentation links are temporarily unavailable.
  Squareone logs the failure, and reports an outage to Sentry.
- Squareone fetches discovery for these cards only on a page whose ``docs.mdx`` uses ``<DatasetDocsCards>``.
