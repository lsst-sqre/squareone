#############################
Overview of GitHub Actions CI
#############################

Squareone uses GitHub Actions to drive both continuous integration (CI) and continuous delivery (CD) workflows.
This page gives an overview of the CI workflows and how they work together.

For an overview of the tooling that GitHub Actions runs for testing and releases, see :doc:`monorepo-architecture`.

Workflow architecture overview
==============================

Squareone uses a combination of standalone and reusable workflows:

.. code-block:: text

   ci.yaml
   ├─→ build-squareone.yaml (reusable)
   └─→ Builds Docker images for branches/PRs

   release.yaml (on push to main)
   └─→ Creates GitHub Releases
       └─→ Triggers docker-release.yaml
           └─→ build-squareone.yaml (reusable)

   dependabot-changesets.yaml
   └─→ Auto-generates changesets for Dependabot PRs

   codeql-analysis.yaml
   └─→ Security scanning (weekly + on main)

.. dropdown:: Currently disabled workflows

   .. code-block:: text

      chromatic-squareone.yaml (disabled)
      chromatic-squared.yaml (disabled)
      ├─→ run-chromatic.yaml (reusable)
      └─→ Visual regression testing infrastructure (available for future use)

See individual sections below for detailed documentation of each workflow.

Testing branches and pull requests — ci.yaml
============================================

The ``ci.yaml`` workflow tests each pull request and pushes to ``main``.
This CI workflow builds each package and application, and runs tests and linters with Turborepo pipelines.

**Triggers:**

- ``push``: All branches except ``dependabot/**``, ``renovate/**``, ``tickets/**``, ``u/**``
- ``pull_request``: All pull requests

Workflow jobs
-------------

The ``ci.yaml`` workflow consists of four main jobs:

Path filtering (changes job)
^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Uses the ``dorny/paths-filter`` action to detect if the :file:`docs/` directory has changed.
This allows the documentation build job to run conditionally, saving CI time when docs haven't been modified.

Main testing (test job)
^^^^^^^^^^^^^^^^^^^^^^^

Runs comprehensive testing in a Playwright container (``mcr.microsoft.com/playwright``).
The container ensures consistent browser testing environments.

Key steps:

1. **Docker Version Validation**: Runs :file:`scripts/validate-docker-versions.js` to ensure Dockerfile version tags match :file:`package.json` versions for Node.js, pnpm, and Turborepo
2. **Format Check**: Verifies code formatting with Prettier
3. **Lint**: Runs ESLint with Turborepo remote caching
4. **Build**: Builds all packages and applications with Turborepo remote caching
5. **Test**: Runs vitest tests and Storybook tests with Turborepo remote caching

The workflow uses :doc:`Turborepo's remote caching <remote-cache>` (configured via ``TURBO_TOKEN``, ``TURBO_API``, ``TURBO_TEAM``) to speed up builds by reusing cached results from previous runs.

Docker image build (build-squareone job)
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Builds Docker images for the squareone application using the :file:`.github/workflows/build-squareone.yaml` reusable workflow.

**Conditional execution:**

- Runs on: Git tags, ``tickets/**`` branches, ``dependabot/**`` PRs, ``changeset-release/**`` branches
- **Push behavior**: Pushes images to ``ghcr.io`` registry *except* for:

  - ``dependabot/**`` branches (build-only validation)
  - ``changeset-release/**`` branches (build-only validation)

For branches that push images, they are tagged with the branch name.
For example, the ``tickets/DM-40262`` branch will build and push the ``ghcr.io/lsst-sqre/squareone:tickets-DM-40262`` image.
You can use these images to test your application in Phalanx development environments without making a full release.

.. note::

   Each application has its own build job in ``ci.yaml``.
   Remember to add a new job when you add an application to Squareone.

Documentation build and deploy (docs job)
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Runs conditionally only if the :file:`docs/` directory has changed (based on the ``changes`` job output).

Builds the Sphinx-based documentation site and deploys it to https://squareone.lsst.io using the ``lsst-sqre/ltd-upload`` action.
The default branch is deployed to https://squareone.lsst.io/ and other branches are deployed to https://squareone.lsst.io/v/.

Preparing and making releases — release.yaml
============================================

The release machine is driven by the ``release.yaml`` workflow, which runs the Changesets_ action, https://github.com/changesets/action.
This workflow is triggered on pushes to ``main`` and operates in two modes: :ref:`preparing releases <ci-changesets-prepare-release>` and :ref:`making releases <ci-changesets-make-release>`.

**Concurrency control:** The workflow uses a concurrency group (per workflow and ref) to prevent concurrent releases, ensuring only one release process runs at a time.

Workflow configuration
----------------------

The ``release.yaml`` workflow includes several important configuration steps:

GitHub App authentication
^^^^^^^^^^^^^^^^^^^^^^^^^

Uses the ``tibdex/github-app-token`` action to generate a GitHub token from the Squareone CI GitHub App credentials (``SQUAREONE_CI_GH_APP_ID`` and ``SQUAREONE_CI_GH_APP_PRIVATE_KEY`` secrets).
This token is used instead of the default ``GITHUB_TOKEN`` because commits made with the default token don't trigger subsequent GitHub Actions workflows.

GitHub Packages authentication
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Creates a :file:`~/.npmrc` file to authenticate with GitHub Packages using the GitHub App token.
This allows the workflow to publish npm packages to the GitHub Packages registry.

Git identity configuration
^^^^^^^^^^^^^^^^^^^^^^^^^^

Manually configures Git identity for the GitHub App bot user:

- User name: ``squareone-ci[bot]``
- Email: ``<app-id>+squareone-ci[bot]@users.noreply.github.com``

The changesets action is configured with ``setupGitUser: false`` to use this manually configured identity instead of the action's default.
This configuration ensures that commits made by the changesets action are properly attributed to the GitHub App bot user so that they can trigger GitHub Actions workflows.

.. _ci-changesets-prepare-release:

Preparing releases
------------------

First, when the changesets action detects a merge with changeset fragments in the :file:`.changeset/` directory, it creates or updates the ``changeset-release`` and associated ``Version packages`` pull request.
In this pull request, the changesets action runs the ``changeset version`` command (via the ``ci:version`` script in :file:`package.json`) to update the version numbers in ``package.json`` of all packages that have changed.
Changesets also deletes the individual changeset fragments in :file:`.changeset/` and updates the changelogs of the affected packages.

.. _ci-changesets-make-release:

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

Releasing Docker images — docker-release.yaml
=============================================

The ``docker-release.yaml`` workflow is triggered by a new GitHub release being published.
Effectively, ``docker-release.yaml`` is triggered automatically by the ``release.yaml`` workflow when it runs the second phase of making a release.

Workflow structure
------------------

The workflow uses a two-job structure:

1. **get-squareone-version**: Extracts the version number from :file:`apps/squareone/package.json`
2. **release-squareone**: Calls the :file:`.github/workflows/build-squareone.yaml` reusable workflow to build and push the Docker image with the extracted version as the tag

This workflow currently only handles the squareone application.
If additional applications are added to the monorepo, new jobs should be added following the same pattern.

The Docker images are tagged according to their :file:`package.json` version number.
For example, if the Squareone application is updated to version 1.2.3, the full image name is ``ghcr.io/lsst-sqre/squareone:1.2.3``.

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

Reusable workflows
==================

Squareone uses reusable workflows to share common build logic across multiple workflows.
These workflows are defined with the ``workflow_call`` trigger and can be called from other workflows.

build-squareone.yaml — Docker image build
-----------------------------------------

**Purpose:** Shared workflow for building and optionally pushing the squareone Docker image.

**Called by:**

- ``ci.yaml`` (for branch and PR builds)
- ``docker-release.yaml`` (for release builds)

**Inputs:**

- ``tag`` (optional): Tag for the Docker image. If not provided, derived from the git branch name.
- ``push`` (optional, default: true): Whether to push the image to the registry. Set to ``false`` for build-only validation.

**Secrets required:**

- ``SENTRY_AUTH_TOKEN``: For uploading source maps to Sentry
- ``TURBO_TOKEN``: For Turborepo remote caching

The workflow uses the ``lsst-sqre/multiplatform-build-and-push`` reusable workflow to build multi-platform Docker images (linux/amd64, linux/arm64) and push them to ``ghcr.io``.

run-chromatic.yaml — Storybook visual testing
---------------------------------------------

**Purpose:** Shared workflow for building Storybook and publishing to Chromatic for visual regression testing.

**Status:** Infrastructure exists but currently not actively used (calling workflows are disabled).

**Called by:**

- ``chromatic-squareone.yaml`` (disabled)
- ``chromatic-squared.yaml`` (disabled)

**Inputs:**

- ``path`` (required): Path to the Storybook directory (e.g., ``apps/squareone`` or ``packages/squared``)
- ``workspaceFilter`` (required): Turborepo workspace filter (e.g., ``squareone`` or ``@lsst-sqre/squared``)

**Secrets required:**

- ``token``: Chromatic project token
- ``TURBO_TOKEN``: For Turborepo remote caching

**Behavior:**

- Builds Storybook using Turborepo (manual build instead of letting Chromatic build)
- On non-main branches: Publishes to Chromatic for visual regression testing
- On main branch: Publishes to Chromatic with ``autoAcceptChanges: true`` to update baselines

CodeQL security scanning — codeql-analysis.yaml
===============================================

The ``codeql-analysis.yaml`` workflow performs automated security vulnerability scanning using GitHub's CodeQL analysis.

**Triggers:**

- ``push``: On pushes to the ``main`` branch
- ``pull_request``: On pull requests targeting the ``main`` branch
- ``schedule``: Weekly on Wednesdays at 9:29 UTC (cron: ``29 9 * * 3``)

**Languages analyzed:**

- ``javascript-typescript``: JavaScript and TypeScript code
- ``actions``: GitHub Actions workflow files

**Permissions required:**

- ``actions: read``
- ``contents: read``
- ``security-events: write``

The workflow uses GitHub's ``codeql-action`` to initialize CodeQL, autobuild the codebase, and perform security analysis.
Results are automatically uploaded to GitHub Security where they can be reviewed in the Security tab.

This provides automated detection of common security vulnerabilities such as SQL injection, cross-site scripting (XSS), code injection, and other CWE-classified security issues.

Chromatic visual testing workflows (disabled)
=============================================

Squareone has infrastructure in place for Chromatic visual regression testing, but these workflows are currently disabled.

chromatic-squareone.yaml
-------------------------

**Status:** DISABLED (``if: false`` in workflow)

**Purpose:** Visual regression testing for the squareone application's Storybook.

**Trigger (when enabled):**

- ``push``: All branches except ``dependabot/**``, ``renovate/**``, and tags

**Configuration:**

- Calls the ``run-chromatic.yaml`` reusable workflow
- Uses ``SQUAREONE_CHROMATIC_TOKEN`` secret
- Targets the ``apps/squareone`` Storybook

chromatic-squared.yaml
----------------------

**Status:** DISABLED (``if: false`` in workflow)

**Purpose:** Visual regression testing for the squared package's Storybook.

**Trigger (when enabled):**

- ``push``: All branches except ``dependabot/**``, ``renovate/**``, and tags

**Configuration:**

- Calls the ``run-chromatic.yaml`` reusable workflow
- Uses ``SQUARED_CHROMATIC_TOKEN`` secret
- Targets the ``packages/squared`` Storybook

Re-enabling Chromatic workflows
-------------------------------

To re-enable these workflows:

1. Remove the ``if: false`` condition from the workflow files
2. Ensure the Chromatic project tokens are configured as secrets:

   - ``SQUAREONE_CHROMATIC_TOKEN``
   - ``SQUARED_CHROMATIC_TOKEN``

3. Ensure the ``TURBO_TOKEN`` secret is available for remote caching

The workflows will then run on every push to publish Storybook builds to Chromatic for visual regression testing.

Secrets and variables reference
===============================

This section documents all GitHub Actions secrets and variables required for the Squareone workflows.

GitHub Actions secrets
----------------------

.. list-table::
   :header-rows: 1
   :widths: 30 50 20

   * - Secret Name
     - Purpose
     - Used By
   * - ``SQUAREONE_CI_GH_APP_ID``
     - GitHub App ID for Squareone CI app (used to generate tokens that trigger workflows)
     - release.yaml, dependabot-changesets.yaml
   * - ``SQUAREONE_CI_GH_APP_PRIVATE_KEY``
     - Private key for Squareone CI GitHub App (PEM format)
     - release.yaml, dependabot-changesets.yaml
   * - ``SENTRY_AUTH_TOKEN``
     - Sentry authentication token for uploading source maps
     - ci.yaml (via build-squareone.yaml), docker-release.yaml (via build-squareone.yaml)
   * - ``TURBO_TOKEN``
     - Turborepo remote cache authentication token
     - ci.yaml, build-squareone.yaml, run-chromatic.yaml
   * - ``LTD_USERNAME``
     - LSST the Docs (LTD) username for documentation deployment
     - ci.yaml (docs job)
   * - ``LTD_PASSWORD``
     - LSST the Docs (LTD) password for documentation deployment
     - ci.yaml (docs job)
   * - ``SQUAREONE_CHROMATIC_TOKEN``
     - Chromatic project token for squareone Storybook (currently unused, workflows disabled)
     - chromatic-squareone.yaml (disabled)
   * - ``SQUARED_CHROMATIC_TOKEN``
     - Chromatic project token for squared Storybook (currently unused, workflows disabled)
     - chromatic-squared.yaml (disabled)

GitHub Actions variables
------------------------

.. list-table::
   :header-rows: 1
   :widths: 30 50 20

   * - Variable Name
     - Purpose
     - Used By
   * - ``TURBO_API``
     - Turborepo remote cache API endpoint URL
     - ci.yaml, build-squareone.yaml, run-chromatic.yaml
   * - ``TURBO_TEAM``
     - Turborepo team/organization identifier
     - ci.yaml, build-squareone.yaml, run-chromatic.yaml

Dependabot secrets
------------------

.. important::

   The following secrets must be configured as **Dependabot secrets** (in addition to GitHub Actions secrets) for the ``dependabot-changesets.yaml`` workflow to function.

.. list-table::
   :header-rows: 1
   :widths: 30 50 20

   * - Secret Name
     - Purpose
     - Used By
   * - ``SQUAREONE_CI_GH_APP_ID``
     - GitHub App ID (same value as Actions secret)
     - dependabot-changesets.yaml
   * - ``SQUAREONE_CI_GH_APP_PRIVATE_KEY``
     - GitHub App private key (same value as Actions secret)
     - dependabot-changesets.yaml

Configuration notes
-------------------

**Configuring GitHub Actions Secrets:**

1. Navigate to repository Settings → Security → Secrets and variables → Actions
2. Click "New repository secret" or use organization-level secrets
3. Add each secret with its corresponding value

**Configuring GitHub Actions Variables:**

1. Navigate to repository Settings → Security → Secrets and variables → Actions
2. Select the "Variables" tab
3. Click "New repository variable"
4. Add each variable with its corresponding value

**Configuring Dependabot Secrets:**

1. Navigate to repository Settings → Security → Secrets and variables → Dependabot
2. Click "New repository secret" or use organization-level secrets
3. Add the required secrets (``SQUAREONE_CI_GH_APP_ID`` and ``SQUAREONE_CI_GH_APP_PRIVATE_KEY``)
4. Set repository access to include the squareone repository

.. note::

   When rotating the Squareone CI GitHub App credentials, both the GitHub Actions secrets AND the Dependabot secrets must be updated.
