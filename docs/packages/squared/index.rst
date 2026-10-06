###################
@lsst-sqre/squared
###################

Squared is the React component library for Squareone and other Rubin Science Platform front-end apps.
It provides the shared building blocks of those apps, such as buttons, cards, notes, data tables, and code blocks, styled with CSS Modules and the |RSD| design tokens.

Squared is developed on GitHub at https://github.com/lsst-sqre/squareone in the :file:`packages/squared` directory.
It's an internal package of the monorepo: it exports its TypeScript source directly, with no build step, so apps that use it must transpile it (for example, with ``transpilePackages: ['@lsst-sqre/squared']`` in the Next.js configuration).
Browse its components in Squared's Storybook_ (``pnpm storybook --filter @lsst-sqre/squared``).

.. toctree::
   :maxdepth: 1
   :caption: Components

   code-block
