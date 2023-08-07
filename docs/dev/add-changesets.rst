#########################################
Add a changeset change log entry for a PR
#########################################

As you develop a PR for Squareone, you should add a changelog entry.
Squareone uses Changesets_ to manage its changelog entries.
Changesets do two important things:

1. They describe the change in a human-readable way that gets incorporated into the change log and GitHub Release descriptions.
2. They express an intent to release a new version of the associated package.

This pages describes how to add a changeset to a PR.

Create a change set
===================

In your PR branch, run changeset:

.. code-block:: bash

   npx changeset

This command prompts you to select which package (or packages) you've changed.
Use the arrow keys to highlight the package and press the spacebar to select it.

.. tip::

   All the selected packages will have the same changeset entry (that is, share the same summary message).
   Different packages/applications can have different version number bumps, though.

   If different packages have distinct changes, you'll want to create multiple changesets that describe those changes.

Next, you'll be prompted to select which of those selected packages have a major version change.
A major change is one that breaks backwards compatibility.
In terms of the version number, a major change is one that increments the first number in the version string.
If none of the packages have a major change, press return to skip this step.

Next you'll be prompted to select which of the remaining selected packages have a *minor* version change.
A minor change is one that adds new functionality without breaking backwards compatibility.
In terms of the version number, a minor change is one that increments the second number in the version string.
If none of the packages have a major change, press return to skip this step.

.. note::

   If you don't specify either a major or minor bump for a package, it'll default to a patch bump (the third number in the version string).

Next, you'll be prompted to write a summary of the changes you've made for each of the selected packages.
You can always update these summaries later in the changeset's markdown file.

Finally, the change set command will write a markdown file in the :file:`.changeset` directory with a unique, random name.

Edit and commit the changeset file
==================================

After changesets exists, you can open the file it created to edit it.
Once you're done, make sure to commit this file to your PR branch.

Next steps
==========

If you're a Squareone maintainer, you can make a release once pull requests with changesets are merged into the ``main`` branch.
See :doc:`making-releases`.

Learn more
==========

Learn more about creating changesets from the `Changesets docs <https://github.com/changesets/changesets/blob/main/docs/adding-a-changeset.md>`__.
