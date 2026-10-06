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

Simulating a GafaelfawrIngress route
------------------------------------

In production, the ``/times-square`` and ``/admin`` routes sit behind a Phalanx ``GafaelfawrIngress``.
Gafaelfawr strips its own session cookie from requests crossing that ingress, so the root layout's server-side prefetches of the user's scopes and user info cannot forward the cookie there.
Instead, the ingress delegates an internal token in the ``X-Auth-Request-Token`` header, which the layout presents to Gafaelfawr as a bearer token (see :file:`apps/squareone/src/lib/auth/serverAuthQuery.ts`).

The development server has no ingress in front of it, so every route runs in cookie mode by default.
To exercise the delegated mode, send the headers the ingress would:

.. code-block:: sh

   curl -s \
     -H 'X-Auth-Request-User: vera' \
     -H 'X-Auth-Request-Token: gt-dev-delegated-token' \
     http://localhost:3000/times-square | grep -o '"user-scopes"[^]]*]'

The mocked ``/auth/api/v1/user-info`` and ``/auth/api/v1/token-info`` endpoints accept ``gt-dev-delegated-token`` as a bearer token and answer for the ``/dev`` persona, whose scopes come from the dev panel.
The server log shows the prefetches running in ``delegated`` mode, the dehydrated state in the HTML carries the persona's ``user-scopes`` and ``user-info`` entries and no ``login-info`` entry (login info is cookie-only, so the browser fetches it), and the header renders the persona's menu.
Sending ``X-Auth-Request-User`` without the token reproduces an ingress that is not configured to delegate: the server warns once and falls back to cookie mode.

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
