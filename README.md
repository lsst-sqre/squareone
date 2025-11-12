# Squareone

[![GitHub Actions](https://github.com/lsst-sqre/squareone/actions/workflows/ci.yaml/badge.svg)](https://github.com/lsst-sqre/squareone/actions/) [![Documentation](https://img.shields.io/badge/squareone-lsst.io-brightgreen.svg)](https://squareone.lsst.io)

Squareone is a monorepo for [Rubin Observatory](https://rubinobservatory.org) Data Management's front-end applications and packages.

**Documentation for developers and operators:** https://squareone.lsst.io

## Applications in Squareone

- `squareone` (the app) is the landing page for the Rubin Science Platform. It's where you start on your journey to use the RSP's portal, notebooks, and APIs to do science with Rubin/LSST data. You can see Squareone in action at [data.lsst.cloud](https://data.lsst.cloud). [The Squareone app is deployed with Phalanx](https://phalanx.lsst.io/applications/squareone/).

## Packages in Squareone

- `@lsst-sqre/global-css` provides base global stylesheets for Squareone applications. These base CSS files mix in a basic reset, CSS custom properties from the Rubin Style Dictionary, and application of these properties to HTML elements.
- `@lsst-sqre/eslint-config` is a shared ESLint configuration for Squareone applications and packages.
- `@lsst-sqre/rubin-style-dictonary` is a design token package based on the [Rubin Observatory Visual Identity Manual](https://docushare.lsst.org/docushare/dsweb/Get/Document-37294/20210212%20Visual%20Identity%20Manual%20—V7.pdf), build with [style-dictionary](https://amzn.github.io/style-dictionary/).
- `@lsst-sqre/squared` is a React component library for Squareone's applications. Squared implements the Rubin Observatory Visual Identity Manual via design tokens from the Rubin Style Dictionary (`@lsst-sqre/rubin-style-dictionary`).
- `@lsst-sqre/tsconfig` is a shared TypeScript configuration for Squareone applications and packages.

## Technology stack

- Squareone is a monorepo managed with [pnpm](https://pnpm.io), [Turborepo](https://turbo.build/repo), and [Changesets](https://github.com/changesets/changesets).

- The apps are built with [Next.js](https://nextjs.org) and [React](https://reactjs.org). Next.js allows the site to be dynamically configured for different Science Platform deployments.

- Styling is done through [styled-components](https://styled-components.com) (along with global CSS).

## Development

### Development with GitHub Codespaces

This repository supports GitHub Codespaces for instant development environments:

1. Click "Code" → "Codespaces" → "Create codespace on main"
2. Wait for the environment to build (~3-5 minutes first time)
3. Run `pnpm dev` to start development

See [`.devcontainer/README.md`](./.devcontainer/README.md) for details.

**Note for external contributors:** Remote caching is only available to repository collaborators. Your codespace will use local caching, which works fine but may be slower on first build.

### Local Development

To set up your development environment and run the site locally, see Squareone's development documentation: https://squareone.lsst.io/dev/
