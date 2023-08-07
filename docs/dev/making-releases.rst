###############
Making releases
###############

Squareone releases are automated with GitHub Actions workflows.
This page describes how to make a release or packages and applications in Squareone

.. note::

   *Releases are not necessary to build Docker images of applications.*
   Whenever you create a pull request with a *ticket branch* (e.g. ``tickets/1234``), the :file:`ci.yaml` GitHub Actions workflow will create a Docker image tagged with the branch name (e.g. ``ghcr.io/squareoneapp/squareone:tickets-DM-1234``).
   Use this feature for testing changes in a development environment, or to quickly bring up a hot fix in production.

Releases are driven by changeset fragments
==========================================

As described in :doc:`add-changesets`, Squareone uses Changesets_ to track changes in each package and application, and to describe the intent to release a new version as a major/minor/patch release.
Releases only happen in the presence of changeset fragments.

Merging the "Version Packages" pull request
===========================================

When the Changesets_ action in GitHub Actions detects changeset fragments on the ``main`` branch, it will create or update a pull request called "Version Packages."
To trigger the release process, merge this pull request.
The GitHub Actions workflows take care of updating package versions, updating changelogs, creating GitHub Releases, releasing packages to GitHub Packages, and Docker images to ``ghcr.io``.

.. note::

   You don't need to immediately merge this pull request.
   If you want to pack multiple pull requests into a single release, you can wait until you're ready to release.
   Changesets will update the "Version Packages" pull request with new changeset fragments as they are added to the ``main`` branch.
