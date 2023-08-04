############
Installation
############

|RSD| is published as a Node package (|rsd-pkg|) on GitHub Packages, making it convenient to use from web projects.
This page describes how to install the |rsd-pkg| package.

Inside the Squareone monorepo
=============================

Projects within the Squareone monorepo should specify |rsd-pkg| as a workspace dependency in their :file:`package.json` file:

.. code-block:: json
   :caption: package.json

   {
     "dependencies": {
       "@lsst-sqre/rubin-style-dictionary": "workspace:*",
     }
   }

The following sections are for projects outside the Squareone monorepo.

Local authentication and installation
=====================================

You need to configure your package manager (``npm`` as a specific example) to authenticate with GitHub Packages to install your package though.

Log into GitHub and `create a new Personal Access Token <https://github.com/settings/tokens/new>`__.
The token needs the ``read:packages`` scope.

Use the generated token value on the command line:

.. code-block:: sh

   npm login --scope=@lsst-sqre --registry=https://npm.pkg.github.com

The ``username`` is your GitHub username, and ``password`` is your token.
This command writes login information to your :file:`~/.npmrc` file.

Next, configure your project to use the ``@lsst-sqre`` scope.
In the root of your project repository (directory that contains :file:`package.json`), create a :file:`.npmrc` file with the following contents:

.. code-block:: text

   @lsst-sqre:registry=https://npm.pkg.github.com/

Finally, install the package:

.. code-block:: sh

   npm install @lsst-sqre/rubin-style-dictionary

Using the token files
=====================

Once the package is installed, you can access token files in different formats in the :file:`dist` directory of the installed package:

.. code-block:: text

   node_modules/@lsst-sqre/rubin-style-dictionary/dist/

For example, in a Next.js project you can directly import CSS into your app wrapper page:

.. code-block:: js

   import '@lsst-sqre/rubin-style-dictionary/dist/tokens.css';
   import '@lsst-sqre/rubin-style-dictionary/dist/tokens.dark.css';

Installing on GitHub Actions
============================

Your project's CI service also needs to use to authenticate with GitHub Packages to download and install |rsd-pkg|.
In the specific case of a GitHub Actions workflow, you can use the built-in ``$GITHUB_TOKEN`` environment variable.

.. code-block:: yaml

   name: CI

   on: [push, pull_request]

   jobs:

     build:
      runs-on: ubuntu-latest

       steps:
         - uses: actions/checkout@v3

         - name: Set up node
           uses: actions/setup-node@v3
           with:
             node-version-file: '.nvmrc'
        
         - name: Authenticate to GitHub Packages
           run: |
             echo "//npm.pkg.github.com/:_authToken=${NPM_PKG_TOKEN}" > ~/.npmrc
           env:
             NPM_PKG_TOKEN: ${{ secrets.GITHUB_TOKEN }}

         - name: Install npm packages
           run: |
             npm install

         - name: Build site
           run: npm run build  # replace with your build command

Installing in a Docker image
============================

Docker builds outside the Squareone monorepo also need to authenticate with GitHub Packages to download and install |rsd-pkg|.
In the Dockerfile, use a build argument to pass in a GitHub token, and use that token to authenticate with GitHub Packages using a technique similar to the GitHub Actions example above.
