#############
rsp-squareone
#############

Squareone is the next-generation landing page for the `Rubin Observatory`_ Science Platform.
It's where you start on your journey to use the RSP's portal, notebooks, and APIs to do science with Rubin/LSST data.

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

Install pre-commit hooks
------------------------

You can automatically lint and format code using pre-commit_ hooks.
Squareone uses Git pre-commit hooks to automatically run eslint and prettier on staged commits.
These hooks are managed by husky, and should be installed automatically when you install Squareone locally.
If not, you can manually install the hooks::

   husky install

Manual linting and formatting
-----------------------------

You can also manually lint and format code.

Lint JavaScript::

   npm run lint

Lint and auto-format JavaScript (powered by Prettier_)::

   npm run lint --fix

Format other types of code with Prettier_::

   npm run format

Start the development server
----------------------------

::

   npm run dev

View the site at http://localhost:3000.
This site auto-updates when running with the development server.

`API routes <https://nextjs.org/docs/api-routes/introduction>`_ are accessed on http://localhost:3000/api/hello.
This endpoint can be edited in ``pages/api/hello.js``.
The ``pages/api`` directory is mapped to ``/api/*``.
Files in this directory are treated as `API routes`_ instead of React pages.

Create a production build
-------------------------

This builds the optimized application::

   npm run build

You can serve the production build locally::

   npm run serve

.. _Next.js: https://nextjs.org
.. _Prettier: https://prettier.io/
.. _pre-commit: https://pre-commit.com/
.. _Rubin Observatory: https://www.lsst.org
.. _React: https://reactjs.org
.. _styled-components: https://styled-components.com
