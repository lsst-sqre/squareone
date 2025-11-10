#############################
Overview of GitHub Actions CI
#############################

Squareone uses GitHub Actions to drive both continuous integration (CI) and continuous delivery (CD) workflows.
This page gives an overview of the CI workflows and how they work together.

For an overview of the tooling that GitHub Actions runs for testing and releases, see :doc:`monorepo-architecture`.

Testing branches and pull requests — ci.yaml
============================================

The ``ci.yaml`` workflow tests each pull request and pushes to ``main``.
This CI workflow builds each package and application, and runs tests and linters with Turborepo pipelines.

For the applications, the CI workflow builds the Docker images and pushes them to the Squareone Docker registry.
These images are tagged with the branch name.
For example, the pull request for the ``tickets/DM-40262``` branch will build and push the ``ghcr.io/lsst-sqre/squareone:tickets-DM-40262``` image.
You can use these images to test your application in Phalanx development environments without making a full release.

.. note::

   Each application has its own build job in ``ci.yaml``.
   Remember to add a new job when you add an application to Squareone.

Lastly, the CI workflow builds the Sphinx-based documentation site (:file:`docs/` in the repository) and pushes it https://squareone.lsst.io.
The default branch is deployed to https://squareone.lsst.io/ and other branches are deployed to https://squareone.lsst.io/v/.

Preparing and making releases — release.yaml
============================================

The release machine is driven by the ``release.yaml`` workflow, which runs the Changesets_ action, https://github.com/changesets/action.
This workflow is triggered on pushes to ``main`` and operates in two modes.

Preparing releases
------------------

First, when the changesets action detects a merge with changeset fragments in the :file:`.changeset/` directory, it creates or updates the ``changeset-release`` and associated ``Version packages`` pull request.
In this pull request, the changesets action runs the ``changeset version`` command (via the ``ci:version`` script in :file:`package.json`) to update the version numbers in ``package.json`` of all packages that have changed.
Changesets also deletes the individual changeset fragments in :file:`.changeset/` and updates the changelogs of the affected packages.

Making releases
---------------

When a maintainer merges the ``changeset-release`` pull request, the changesets action runs again from the ``main`` branch.
This time, it creates the package releases for each package and application that has changed.

For each package/application, changesets creates a GitHub Release containing the changelog update and tags the ``main`` branch with the new version number.
For example, if the Squareone application is updated, the tag is ``squareone@1.2.3``.
If the ``rubin-style-dictionary`` package is updated, the tag is ``@lsst-sqre/rubin-style-dictionary@1.2.3``.

For public npm packages, changesets publishes the new version to the npm registry.
Squareone uses GitHub Packages for its npm registry.

This workflow does not handle Docker images; see :file:`docker-release.yaml` for that.
However, ``release.yaml`` does effectively trigger the Docker release workflows by creating a new GitHub release.

.. note::

   The changesets action in :file:`release.yaml` uses a GitHub App, `Squareone CI <https://github.com/organizations/lsst-sqre/settings/apps/squareone-ci>`__ to issue a GitHub token rather than the default GitHub Actions token, ``GITHUB_TOKEN``.
   This is because Git commits made via that default token don't trigger further GitHub Actions workflows.

Releasing docker images — docker-release.yaml
=============================================

The ``docker-release.yaml`` workflow is triggered by a new GitHub release being published.
Effectively, ``docker-release.yaml`` is triggered automatically by the ``release.yaml`` workflow when it runs the second phase of making a release.

This workflow builds and pushes the Docker images for each application, tagged according to their :file:`package.json` version number.
For example, if the Squareone application is updated, the full image name ``ghcr.io/lsst-sqre/squareone:1.2.3``.

Automating changesets for Dependabot — dependabot-changesets.yaml
=================================================================

The ``dependabot-changesets.yaml`` workflow automatically creates changeset files for dependency updates made by Dependabot.
This ensures that Dependabot PRs follow the same versioning and changelog process as manual changes.

The workflow is triggered by ``pull_request`` events (opened or synchronized) and runs only for PRs created by ``dependabot[bot]``.
It uses the `StafflinePeoplePlus/dependabot-changesets <https://github.com/StafflinePeoplePlus/dependabot-changesets>`__ action to generate appropriate changeset markdown files based on the dependency changes.

Security considerations
-----------------------

This workflow implements several security best practices:

- **Uses ``pull_request`` trigger** (not ``pull_request_target``) to avoid "pwn request" vulnerabilities where untrusted code could execute with write permissions
- **Verifies PR author** using ``github.event.pull_request.user.login`` instead of ``github.actor`` to prevent "Confused Deputy" attacks
- **Follows GitHub's recommendations** for safely automating Dependabot workflows

For more details on the security design, see the comments in the workflow file.

Dependabot secrets requirement
------------------------------

.. important::

   This workflow requires GitHub App credentials to be configured as **Dependabot secrets**, not just GitHub Actions secrets.

When Dependabot triggers a workflow via ``pull_request`` events, GitHub treats it as if it came from a repository fork for security reasons.
This means:

- Only **Dependabot secrets** are accessible to the workflow (GitHub Actions secrets are not available)
- The default ``GITHUB_TOKEN`` has read-only permissions
- This is by design to prevent secret leakage through malicious dependency updates

The workflow uses a GitHub App (Squareone CI) to generate a token that can trigger other workflows (commits made with the default ``GITHUB_TOKEN`` don't trigger workflows).
The app credentials must be available as Dependabot secrets.

Configuring Dependabot secrets
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Organization administrators must configure these secrets at the organization or repository level:

1. Navigate to Settings → Security → Secrets and variables → Dependabot
2. Create two Dependabot secrets with the same values as the corresponding GitHub Actions secrets:

   - ``SQUAREONE_CI_GH_APP_ID`` (numeric app ID)
   - ``SQUAREONE_CI_GH_APP_PRIVATE_KEY`` (PEM-formatted private key)

3. Set repository access to include ``squareone``

.. note::

   These secrets must be duplicated (exist as both Actions secrets and Dependabot secrets) because GitHub isolates Dependabot workflows for security.
   If the credentials are rotated, both sets of secrets must be updated.

Without these Dependabot secrets configured, the workflow will fail with an error like "app_id is not set" even though the GitHub Actions secrets are properly configured.

For more information, see GitHub's documentation on `Automating Dependabot with GitHub Actions <https://docs.github.com/en/code-security/dependabot/working-with-dependabot/automating-dependabot-with-github-actions>`__ and `Managing encrypted secrets for Dependabot <https://docs.github.com/en/code-security/dependabot/working-with-dependabot/managing-encrypted-secrets-for-dependabot>`__.
