####################################
Setting up a development environment
####################################

This page describes how to set up a development environment for the Squareone monorepo.

To get the Squareone codebase, fork the `Squareone repository`_ if you're an external contributor, or clone it if you're a member of the repository or SQuaRE:

.. code-block:: bash

    git clone https://github.com/lsst-sqre/squareone

Node.js
=======

Squareone uses Node.js.
To get a version of Node.js that matches how we run Squareone in CI and production, use `nvm`_.
First, follow the nvm_ installation documentation then activate the node environment in a cloned Squareone repository:

.. code-block:: bash

    nvm use

.. tip::

   The node version is defined by the :file:`.nvmrc` file in the Squareone repository.

pnpm
====

Squareone uses pnpm_ to manage Node.js dependencies.
See the `pnpm installation documentation <https://pnpm.io/installation>`_ to install it.

Install Squareone dependencies
==============================

Install the JavaScript packages:

.. code-block:: bash

   pnpm install turbo --global
   pnpm install

When you install the Squareone monorepo package, it will also install the Husky-based pre-commit hooks that lint the codebase.

Installing turbo globally is recommended so that you have the :command:`turbo` command available.
This globally-installed turbo will defer to the turbo installed in the Squareone monorepo, so don't worry about minor version mismatches.

.. _set-up-turborepo-cache:

Turborepo remote caching
========================

The Squareone monorepo supports optional remote caching for faster builds using a custom Turborepo cache server at ``https://roundtable.lsst.cloud/turborepo-cache``.

**External contributors:** *no setup required.* Run commands normally (:command:`pnpm build`, :command:`pnpm dev`, etc.).
You'll still use Turborepo's local caching, provides significant speedups for repeated tests and builds.
The remote cache is optional and does not affect your ability to contribute.

**Rubin Observatory staff:** If you want to use the remote cache, you'll need to authenticate.
The ``TURBO_TOKEN`` is a Gafaelfawr user access token for roundtable.lsst.cloud with the ``write:git-lfs`` scope.

.. note::

   If ``TURBO_API``, ``TURBO_TOKEN``, and ``TURBO_TEAM`` are already set as environment variables (e.g., in CI/CD pipelines with secret injection), the wrapper will automatically use them without requiring any configuration files.

Choose one of the following authentication methods:

.. tab-set::

    .. tab-item:: 1Password authentication

        Use 1Password CLI for secure credential management (recommended for personal machines).

        1. **Install 1Password CLI** (if not already installed):

           .. code-block:: bash

              brew install 1password-cli

        2. **Sign in to 1Password CLI**:

           .. code-block:: bash

              op signin lsstit.1password.com

           This ensures you're signed into the LSST IT account where the Employee vault is located.

        3. **Store credentials in 1Password**:

           Create an item in your "Employee" vault (lsstit.1password.com account) named "Turborepo Remote Cache" with these fields:

           - ``api-url``: ``https://roundtable.lsst.cloud/turborepo-cache``
           - ``team``: ``lsst-sqre``
           - ``token``: Your Gafaelfawr user access token (obtain from roundtable.lsst.cloud)

        4. **Create .env.op file** in the repository root:

           .. code-block:: bash

              cp .env.op.example .env.op

           The file should contain:

           .. code-block:: ini

              TURBO_API="op://Employee/Turborepo Remote Cache/api-url"
              TURBO_TOKEN="op://Employee/Turborepo Remote Cache/token"
              TURBO_TEAM="op://Employee/Turborepo Remote Cache/team"

           The wrapper automatically uses the lsstit.1password.com account. Adjust the vault name ("Employee") and item name if you stored the credentials differently.

        5. **Run commands normally** - authentication happens automatically:

           .. code-block:: bash

              pnpm build  # Uses remote cache via 1Password

        The wrapper script will detect :file:`.env.op` and automatically use ``op run`` to inject your credentials securely.

    .. tab-item:: .env file authentication

        Use a plain :file:`.env` file for direct environment variable access.

        1. **Create .env file** in the repository root:

           .. code-block:: bash

              cp .env.example .env

        2. **Fill in your credentials** in :file:`.env`:

           .. code-block:: ini

              TURBO_API=https://roundtable.lsst.cloud/turborepo-cache
              TURBO_TOKEN=your-gafaelfawr-token-here
              TURBO_TEAM=lsst-sqre

        3. **Run commands normally**:

           .. code-block:: bash

              pnpm build  # Uses remote cache via .env

        The wrapper script will detect :file:`.env` and automatically load these variables using ``dotenv``.
        This file should never be committed to Git and is included in :file:`.gitignore`.

See :doc:`remote-cache` for more details about the remote cache authentication system, troubleshooting, and infrastructure information.

.. _docs-setup:

Python dependencies for documentation with uv
=============================================

The Squareone documentation uses Sphinx_, a Python-based documentation generator.
To make it easier to install and manage Python dependencies, we use `uv`_ to manage a virtual environment and run tasks in them.
See the `uv installation documentation <https://docs.astral.sh/uv/getting-started/installation/>`_ for details.

Next steps
==========

See :doc:`development-tasks` for common development tasks.
