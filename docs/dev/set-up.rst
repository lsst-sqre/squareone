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

.. _docs-setup:

Python dependencies for documentation
=====================================

The Squareone documentation uses Sphinx_, a Python-based documentation generator.
To make it easier to install and manage Python dependencies, we use `nox`_ to manage a virtual environment and run tasks in them.

To install nox, run:

.. code-block:: bash

   python -m pip install nox

Next steps
==========

See :doc:`development-tasks` for common development tasks.
