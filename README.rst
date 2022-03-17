.. image:: https://github.com/lsst-sqre/squareone/actions/workflows/ci.yaml/badge.svg
   :target: https://github.com/lsst-sqre/squareone/actions/
.. image:: https://img.shields.io/badge/squareone-lsst.io-brightgreen.svg
   :target: https://squareone.lsst.io

#########
Squareone
#########

Squareone is the next-generation landing page for the `Rubin Observatory`_ Science Platform.
It's where you start on your journey to use the RSP's portal, notebooks, and APIs to do science with Rubin/LSST data.
Squareone is also a visual interface for user notifications from the `Semaphore`_ service.

Squareone is deployed with `Phalanx`_.

**Documentation:** https://squareone.lsst.io

Technology stack
================

- The site is built with Next.js_ and React_.
  Next.js_ allows the site to be dynamically configured for different Science Platform deployments.

- Styling is done through styled-components_ (along with global CSS).

Development workflow primer
===========================

Node version
------------

The Node.js version used by this this project is intended to be built with a Node.js version that's encoded in the `.nvmrc <./.nvmrc>`__ file.
To adopt this node version, we recommend `installing and using the node version manager <https://github.com/nvm-sh/nvm>`__.

Then you can use the preferred node version by running ``nvm`` from the project root::

   nvm use

Install locally
---------------

Install the JavaScript packages::

   npm install

Install git hooks
-----------------

Git hooks allow you to automatically lint and format code with eslint and prettier on each commit.
These hooks are managed by `husky <https://typicode.github.io/husky/#/>`_, and should be installed automatically when you install Squareone locally.
If not, you can manually install the hooks::

   husky install

Manual linting and formatting
-----------------------------

You can also manually lint and format code.

Lint and format JavaScript via `next lint <>`__::

   npm run lint

Check formatting other types of code with Prettier_::

   npm run format:check

Or automatically fix files::

   npm run format

Start the development server
----------------------------

::

   npm run dev

View the site at http://localhost:3000.
This site auto-updates when running with the development server.

`API routes <https://nextjs.org/docs/api-routes/introduction>`_ are accessed on http://localhost:3000/api/*.
The ``pages/api`` directory is mapped to ``/api/*``.
Files in this directory are treated as `API routes`_ instead of React pages.
The purpose of the ``pages/api/dev`` endpoints are to mock external services in the RSP; see the re-writes in `next.config.js`.

Create a production build
-------------------------

This builds the optimized application::

   npm run build

You can serve the production build locally::

   npm run serve

.. _Next.js: https://nextjs.org
.. _Prettier: https://prettier.io/
.. _Rubin Observatory: https://www.lsst.org
.. _React: https://reactjs.org
.. _styled-components: https://styled-components.com
.. _Semaphore: https://github.com/lsst-sqre/semaphore
.. _Phalanx: https://phalanx.lsst.io
