# @lsst-sqre/eslint-config

## 0.3.0

### Minor Changes

- [#386](https://github.com/lsst-sqre/squareone/pull/386) [`dd3a96b`](https://github.com/lsst-sqre/squareone/commit/dd3a96b5eaa205db856f2591f94547b88cbcb006) Thanks [@dependabot](https://github.com/apps/dependabot)! - Migrate ESLint configuration to v9 flat config format

  - Replace legacy `.eslintrc.js` files with `eslint.config.mjs` across all packages and apps
  - Convert shared `@lsst-sqre/eslint-config` to export a flat config array using `eslint-config-turbo/flat` and `FlatCompat` for `eslint-config-next`
  - Add `@eslint/eslintrc` dependency for FlatCompat bridging where native flat config is not yet available
  - Remove inline `eslintConfig` from squareone's `package.json` in favor of a standalone `eslint.config.mjs`
  - Add explicit `lint` script to squareone

## 0.2.1

### Patch Changes

- [#250](https://github.com/lsst-sqre/squareone/pull/250) [`eff9f7a`](https://github.com/lsst-sqre/squareone/commit/eff9f7a9716cdf974372f74f338a81f86f98f75c) Thanks [@jonathansick](https://github.com/jonathansick)! - Align dependency versions across packages to prepare for Dependabot groups

  - Update eslint-config-next from 12.2.4 to 15.5.0 in eslint-config package
  - Standardize eslint to 8.46.0 across squared and squareone packages
  - Update swr from 2.2.1 to 2.3.6 in squared package
  - Update @fortawesome/react-fontawesome from 0.2.0 to 0.2.2 in squareone package

  These version alignments eliminate inconsistencies that could cause conflicts when Dependabot groups are enabled for coordinated dependency updates.

## 0.2.0

### Minor Changes

- [#200](https://github.com/lsst-sqre/squareone/pull/200) [`279dbcb6352839f434a729cccdd9d12f74cf7eac`](https://github.com/lsst-sqre/squareone/commit/279dbcb6352839f434a729cccdd9d12f74cf7eac) Thanks [@jonathansick](https://github.com/jonathansick)! - Upgrade Node.js to version 22.13.0 LTS

  Updated the Node.js runtime requirement from 18.x to 22.x LTS, which includes:

  - Latest LTS stability and security improvements
  - Updated build toolchain and CI environment
  - Improved performance and new language features

  This change updates the development environment and deployment requirements.

## 0.1.0

### Minor Changes

- [#153](https://github.com/lsst-sqre/squareone/pull/153) [`69446f1`](https://github.com/lsst-sqre/squareone/commit/69446f1c3e1cca7c3961439825679f0851826f6f) Thanks [@jonathansick](https://github.com/jonathansick)! - This is the first internal release of the eslint-config package. It's inspired by the Turborepo examples: https://github.com/vercel/turbo/tree/main/examples/design-system/packages/eslint-config-acme
