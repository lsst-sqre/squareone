####################################
Setting up a development environment
####################################

This page describes how to set up a development environment for Squareone and the common development tasks.

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

Configure pnpm to use packages from @lsst-sqre
==============================================

Squareone uses npm packages published to the GitHub Package Registry in the ``lsst-sqre`` org.
Although they're publicly-available, you will need a `GitHub Personal Access Token <https://github.com/settings/tokens/new>`__ with ``read:packages``.

Add an ``@lsst-sqre`` registry entry to your ``~/.npmrc`` file using the token you created:

.. code-block:: text
   :caption: ~/.npmrc

    @lsst-sqre:registry=https://npm.pkg.github.com/
    //npm.pkg.github.com/:_authToken=<...>

Install Squareone dependencies
==============================

Install the JavaScript packages:

.. code-block:: bash

   pnpm install

When you install the Squareone package, it will also install the Husky-based pre-commit hooks that lint the codebase.

Next steps
==========

See :doc:`development-tasks` for common development tasks.
