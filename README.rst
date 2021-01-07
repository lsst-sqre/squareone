#############
rsp-squareone
#############

Squareone is the next-generation landing page for the Rubin Science Platform.
It's where you start on your journey to use the RSP's portal, notebooks, and APIs to do science with Rubin/LSST data.

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

   yarn install

Install pre-commit hooks
------------------------

You can automatically lint and format code using pre-commit_ hooks.

First, install pre-commit::

   pip install pre-commit

And initialize pre-commit in your clone::

   pre-commit install

You can run pre-commit over all files::

   pre-commit run --all-files

Manual linting and formatting
-----------------------------

You can also manually lint and format code.

Lint JavaScript::

   yarn lint

Lint and auto-format JavaScript (powered by Prettier_)::

   yarn lint --fix

Format other types of code with Prettier_::

   yarn format

Start the development server
----------------------------

::

   yarn dev

View the site at http://localhost:3000.
This site auto-updates when running with the development server.

`API routes <https://nextjs.org/docs/api-routes/introduction>`_ are accessed on http://localhost:3000/api/hello.
This endpoint can be edited in ``pages/api/hello.js``.
The ``pages/api`` directory is mapped to ``/api/*``.
Files in this directory are treated as `API routes`_ instead of React pages.

Create a production build
-------------------------

This builds the optimized application::

   yarn build

You can serve the production build locally::

   yarn serve

.. _Prettier: https://prettier.io/
.. _pre-commit: https://pre-commit.com/
