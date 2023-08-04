####################
Using the CSS tokens
####################

Once the package is installed, you can access token files in different formats in the :file:`dist` directory of the installed package:

.. code-block:: text

   node_modules/@lsst-sqre/rubin-style-dictionary/dist/

For example, in a Next.js project you can directly import CSS into your app wrapper page:

|RSD| provides CSS files with design tokens as CSS custom properties (aka CSS variables).
In your Next.js app you can import these files to incorporate the tokens into your app's CSS:

.. code-block:: js

   import '@lsst-sqre/rubin-style-dictionary/dist/tokens.css';
   import '@lsst-sqre/rubin-style-dictionary/dist/tokens.dark.css';

The ``tokens.css`` file contains the core set of design tokens including the "light" themed colours.

Dark mode
=========

The ``tokens.dark.css`` file contains the dark themed colours properties that override the light themed colours.
Those colours are automatically scoped inside the ``[data-theme="dark"]`` selector.
