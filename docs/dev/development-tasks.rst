#################
Development tasks
#################

Once you have a working development environment (see :doc:`set-up`), you can run tasks to help you develop and test applications and packages in the Squareone monorepo.
This page outlines those development tasks.

Start the development server
============================

You can spin up auto-reloading development versions of all the apps at once:

.. code-block:: sh

   pnpm dev

Find the URLs for the apps in the output of the command, or:

- View Squareone at http://localhost:3000.

  `API routes <https://nextjs.org/docs/api-routes/introduction>`__ are accessed on ``http://localhost:3000/api/*``.
  The ``pages/api`` directory is mapped to ``/api/*``.
  Files in this directory are treated as API routes instead of React pages.
  The purpose of the ``pages/api/dev`` endpoints are to mock external services in the RSP; see the re-writes in :file:`next.config.js`.

Run a single app in development
-------------------------------

You can run a single app (e.g. Squareone) in development mode:

.. code-block:: sh

   pnpm dev --filter squareone

.. tip::

   Turbo Repo provides a powerful filtering syntax to let you run tasks on a subsets of app and packages, and their dependencies or dependents.
   Learn more in the `Turbo Repo --filter documentation`_.

Start the Storybook server
==========================

Storybook_ is an environment for designing, testing, and documenting UI components.
Applications and component packages in Squareone have their own Storybook environments.
From the monorepo root, you can start up the Storybook server for all apps and packages:

.. code-block:: bash

   pnpm storybook

Linting and formatting
======================

The monorepo uses Biome_ as the primary tool for code formatting and linting, with ESLint providing additional comprehensive rule coverage.
Prettier_ is still used specifically for YAML files.
These tools run automatically in your IDE and when you commit code (via Husky pre-commit hooks), but you can also run them manually.

Format code with Biome
----------------------

Check code formatting for JavaScript, TypeScript, JSON, and CSS:

.. code-block:: bash

   pnpm biome:format:check

Automatically format and fix files:

.. code-block:: bash

   pnpm biome:format

Lint code with Biome
--------------------

Biome provides fast linting for correctness, accessibility, performance, security, and code style issues.
This command allows warnings but fails on errors:

.. code-block:: bash

   pnpm biome:lint

Comprehensive linting with ESLint
----------------------------------

ESLint runs via Turborepo and provides comprehensive rule coverage across all packages.
This is the same linting that runs in CI:

.. code-block:: bash

   pnpm lint

Format YAML files
-----------------

YAML files are formatted with Prettier (Biome doesn't support YAML):

.. code-block:: bash

   pnpm prettier:yaml

Running local CI validation
----------------------------

You can run the complete CI pipeline locally to catch issues before pushing.
This validates formatting, linting, type checking, tests, builds, and Docker version synchronization:

.. code-block:: bash

   pnpm localci

This command runs all the same checks as the GitHub Actions CI workflow, including:

- Docker version validation (ensures Dockerfile versions match package.json)
- Biome format checking
- YAML formatting with Prettier
- ESLint linting
- TypeScript type checking
- Unit and Storybook tests
- Production builds
- Biome linting

.. tip::

   Run ``pnpm localci`` before pushing to ensure your changes will pass CI.
   It's faster to catch issues locally than to wait for the GitHub Actions workflow.

Create a production build
=========================

You can create a production build of all applications and packages, which can be a useful check of a process that typically runs inside the Docker image build:

.. code-block:: bash

   pnpm build

To build a specific application and its dependencies, use the ``--filter`` flag:

.. code-block:: bash

   pnpm build --filter squareone

.. tip::

   Learn more about the filtering syntax in the `Turbo Repo --filter documentation`_.

.. TODO: Implement a way to "start" apps with turbo.
.. You can serve the production build locally:

.. .. code-block:: bash

..    npm run serve

VS Code tasks
=============

Many of these tasks are also available as VS Code tasks.
From the VS Code command pallet run ``Tasks: Run Task`` and select the task you want to run.
