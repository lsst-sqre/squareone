#################
Development tasks
#################

Once you have a working development environment (see :doc:`set-up`), you can run tasks to help you develop and test the project.
This page outlines those development tasks.

Start the development server
============================

.. code-block:: sh

   pnpm dev

View the site at http://localhost:3000.
This site auto-updates when running with the development server.

`API routes <https://nextjs.org/docs/api-routes/introduction>`__ are accessed on ``http://localhost:3000/api/*``.
The ``pages/api`` directory is mapped to ``/api/*``.
Files in this directory are treated as API routes instead of React pages.
The purpose of the ``pages/api/dev`` endpoints are to mock external services in the RSP; see the re-writes in :file:`next.config.js`.

Start the Storybook server
==========================

Storybook_ is an environment for documenting and designing React components.
You can start up Squareone's Storybook development site::

.. code-block:: bash

   pnpm storybook

Manual linting and formatting
-----------------------------

Typically linting is run by your IDE while you develop and again when you commit code (via Husky).
You can also manually lint and format code.

Lint JavaScript via `next lint`_:

.. code-block:: bash

   pnpm lint

Check formatting with Prettier_:

.. code-block:: bash

   pnpm format:check

Or automatically fix files with Prettier_:

.. code-block:: bash

   pnpm format

Create a production build
=========================

You can create a production build of the application, which can be a useful check of a process that typically runs inside the Docker image build:

.. code-block:: bash

   npm run build

You can serve the production build locally:

.. code-block:: bash

   npm run serve

VS Code tasks
=============

Many of these tasks are also available as VS Code tasks.
From the VS Code command pallet run ``Tasks: Run Task`` and select the task you want to run.
