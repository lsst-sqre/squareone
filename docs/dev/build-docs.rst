#######################
Build the documentation
#######################

Like other Rubin Observatory projects, Squareone's documentation is build with Sphinx using the `Documenteer <https://documenteer.lsst.io>`__ package for configuration and theming.
Sphinx runs in a Python environment.
To set up the environment, see :ref:`docs-setup` in the set-up guide.

Build the documentation
=======================

Run the documentation build through Nox, which will set up the environment and run Sphinx:

.. code-block:: bash

   nox -s docs

Test links
==========

Run a link checker:

.. code-block:: bash

   nox -s docs-linkcheck

Next steps
==========

- `Learn more about the Documenteer user configuration <https://documenteer.lsst.io/guides/>`__
- `Learn about our user documentation style guide <https://developer.lsst.io/user-docs/index.html>`__
