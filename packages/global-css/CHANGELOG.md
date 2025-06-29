# @lsst-sqre/global-css

## 0.2.2

### Patch Changes

- Updated dependencies [[`7a41984e02439cd16a2786196330492197f5c465`](https://github.com/lsst-sqre/squareone/commit/7a41984e02439cd16a2786196330492197f5c465)]:
  - @lsst-sqre/rubin-style-dictionary@0.5.1

## 0.2.1

### Patch Changes

- Updated dependencies [[`9b717643a038f3936f520c2f85dfaa2d7ad2b0d3`](https://github.com/lsst-sqre/squareone/commit/9b717643a038f3936f520c2f85dfaa2d7ad2b0d3), [`1323de7a7e4deb3ada11ebbf650883c70221958f`](https://github.com/lsst-sqre/squareone/commit/1323de7a7e4deb3ada11ebbf650883c70221958f)]:
  - @lsst-sqre/rubin-style-dictionary@0.5.0

## 0.2.0

### Minor Changes

- [#173](https://github.com/lsst-sqre/squareone/pull/173) [`c5dac7f`](https://github.com/lsst-sqre/squareone/commit/c5dac7ff7b8846e665918b32a7fdac8193615dfd) Thanks [@jonathansick](https://github.com/jonathansick)! - Migrated Squareone CSS custom properties / design tokens to global-css from the globals.css file in the Squareone app

  With this change, any app as well as the Squared component library can use CSS custom properties such as the elevations (box-shadows, e.g. `--sqo-elevation-md`) and transitions (`--sqo-transition-basic`) that are included as global CSS custom properties.

## 0.1.0

### Minor Changes

- [#153](https://github.com/lsst-sqre/squareone/pull/153) [`5ee421b`](https://github.com/lsst-sqre/squareone/commit/5ee421bdd8f1c6f922913028ad48284f941189f1) Thanks [@jonathansick](https://github.com/jonathansick)! - Created the global-css package to bundle base CSS stylesheets for Squareone applications.
