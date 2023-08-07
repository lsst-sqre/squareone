#####################################
Overview of the monorepo architecture
#####################################

The Squareone repository, https://github.com/lsst-sqre/squareone, is a *monorepo*.
This page describes the impetus for this architecture, and the key components that make it work.

What does a monorepo look like
==============================

A monorepo is a single repository that contains multiple projects.
In Squareone, there are two types of projects: *packages* and *apps*.

Within the repository, packages and apps are stored in separate directories:

.. code-block:: text

   lsst-sqre/squareone/
   ├── package.json
   ├── apps/
   │   └── squareone/
   │       └── package.json
   └── packages/
       └── rubin-style-dictionary/
           └── package.json

This structure is different from the polyrepo structure that's more common in SQuaRE and Rubin Observatory in general where each project has its own GitHub repository.

The advantages of a monorepo for the front-end
==============================================

A polyrepo architecture is a good fit for the Python packages and web applications that SQuaRE creates because they have well-defined interfaces and are developed by distinct groups of team members.
We do share code between projects through shared libraries like Safir.
Generally its okay for common tooling developed in one application to filter into Safir and then slowly become adopted in other applications.

The front-end is different, though.
We have a small number of front-end applications (currently just the RSP homepage, but soon homepages for Roundtable and the documentation portal), and all of those applications share the same components and design tokens.
When a design token changes, or a React component is modified, we both want to make sure that change works for all of our applications, and also that all applications can be released with that improvement.
In a polyrepo, we would need to locally link the packages we're working on with development versions of the applications to test them, a process that's time consuming and also difficult to automate for CI.
We would also need to make separate pull requests and releases for each repository.
Given that our goal is to develop, test, and release all of our front-end applications in unison, the overhead of a polyrepo isn't a good fit.

A monorep doesn't mean we lose the ability to publish packages and release applications as individual entities.
Each package has a change log and maintains its own version number, has its own GitHub Releases, and can be published to a package and Docker registry independently.
This is made possible by the tooling we use to manage the monorepo.

Monorepo tooling
================

pnpm
----

*Workspaces* are what make monorepos work.
With workspaces, a project can depend on other projects in the same repository.
For example, the squareone application depends on the rubin-style-dictionary package like this:

.. code-block:: json
   :caption: apps/squareone/package.json

   {
     "name": "squareone",
     "dependencies": {
       "...",
       "@lsst-sqre/rubin-style-dictionary": "workspace:*"
     }
   }

The workspace prefix means that the package is installed from the repository, rather than a package registry.

pnpm_ is a package manager with the best implementation of workspaces, so we use it over npm or yarn.

Turborepo
---------

Turborepo_ is a tool that makes it easy to run development tasks across multiple workspaces at once.
The scripts in the root :file:`package.json` file typically run Turborepo commands.
These commands are pipelines defined in the :file:`turbo.json` file.
When you run a command like :command:`pnpm run build`, Turborepo runs the ``build`` task in each workspace, automatically considering the dependencies between workspaces.
Turborepo makes excellent use of caching so tasks are only run when they need to be.

Changesets
----------

Changesets_ is a tool that coordinates release automation.
With each PR, developers create a changeset file (markdown with front-matter) that describes the changes.
Besides being a changelog fragment, the changeset also contains metadata that specifies what packages were changed, and whether those changes are major, minor, or patches.
After a pull request is merged, Changesets_ runs within GitHub Actions to prepare a pull request that proposes to bump the versions of the changed packages.
Dependents of changed packages automatically get patch version bumps too indicating that they should be released with the new version of their dependency.
Merging this PR triggers the release process, again in GitHub Actions, for the changed packages.

.. seealso::

   :doc:`github-actions-architecture` for more on the Changesets-driven release process.

Further reading
===============

The Turborepo documentation includes a `Monorepo Handbook <https://turbo.build/repo/docs/handbook>`__ that goes further into the advantages of monorepos and how they work.
