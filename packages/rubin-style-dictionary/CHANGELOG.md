# @lsst-sqre/rubin-style-dictionary

## 0.6.0

### Minor Changes

- [#218](https://github.com/lsst-sqre/squareone/pull/218) [`0baaffd667f8d53aeb2963f36371415516b2c0ff`](https://github.com/lsst-sqre/squareone/commit/0baaffd667f8d53aeb2963f36371415516b2c0ff) Thanks [@jonathansick](https://github.com/jonathansick)! - Add complete color ramps (100-800) for semantic colors

  Implements full color ramps for all semantic colors to support the Badge component and future UI components:

  - **Blue**: Complete 100-800 ramp with HSL-based color calculations
  - **Green**: Complete 100-800 ramp with HSL-based color calculations
  - **Orange**: Complete 100-800 ramp with HSL-based color calculations
  - **Purple**: Complete 100-800 ramp with HSL-based color calculations
  - **Red**: Complete 100-800 ramp with HSL-based color calculations
  - **Yellow**: Complete 100-800 ramp with HSL-based color calculations

  Each color ramp includes:

  - Shade 100-200: Light tints for soft variant backgrounds
  - Shade 300-500: Medium shades and base colors
  - Shade 600: Dark shade optimized for solid backgrounds and text (WCAG AA compliant)
  - Shade 700-800: Darker shades for depth and contrast

  All color combinations have been tested and verified to meet WCAG AA contrast requirements (4.5:1 minimum) for:

  - Solid variant: 600 shade on white background
  - Soft variant: 600 shade text on 200 shade background
  - Outline variant: 600 shade on page background

  These tokens are ready for use in Badge component variants and other UI elements requiring semantic color theming.

## 0.5.1

### Patch Changes

- [#188](https://github.com/lsst-sqre/squareone/pull/188) [`7a41984e02439cd16a2786196330492197f5c465`](https://github.com/lsst-sqre/squareone/commit/7a41984e02439cd16a2786196330492197f5c465) Thanks [@jonathansick](https://github.com/jonathansick)! - Use the project orange accent for color-orange-500 (was accidentally red before).

## 0.5.0

### Minor Changes

- [#186](https://github.com/lsst-sqre/squareone/pull/186) [`1323de7a7e4deb3ada11ebbf650883c70221958f`](https://github.com/lsst-sqre/squareone/commit/1323de7a7e4deb3ada11ebbf650883c70221958f) Thanks [@jonathansick](https://github.com/jonathansick)! - Add triad logos (Rubin+NSF+DOE).

### Patch Changes

- [#186](https://github.com/lsst-sqre/squareone/pull/186) [`9b717643a038f3936f520c2f85dfaa2d7ad2b0d3`](https://github.com/lsst-sqre/squareone/commit/9b717643a038f3936f520c2f85dfaa2d7ad2b0d3) Thanks [@jonathansick](https://github.com/jonathansick)! - Update partner logo lineup.

## 0.4.2

### Patch Changes

- [#148](https://github.com/lsst-sqre/squareone/pull/148) [`0e4d392`](https://github.com/lsst-sqre/squareone/commit/0e4d392afafe8437f39af3018ecf47d4a76567a2) Thanks [@jonathansick](https://github.com/jonathansick)! - Tweaks to the release process:

  - Associate rubin-style-dictionary with the lsst-sqre/squareone monorepo in its package.json metadata.

## 0.4.1

### Patch Changes

- [#143](https://github.com/lsst-sqre/squareone/pull/143) [`13e6f4c`](https://github.com/lsst-sqre/squareone/commit/13e6f4c4415e913665dd8922c0e079dd0fefe7ba) Thanks [@jonathansick](https://github.com/jonathansick)! - Migrated lsst-sqre/squareone into a turbo-based monorepo. Rubin Style Dictionary is now a package inside the monorepo.

## 0.4.0 (2022-12-01)

Added "crop" variants of all full-size and intermediate-size Rubin imagotype assets. For example, `assets/rubin-imagotype/rubin-imagotype-color-on-white-crop.svg` is a cropped version of `assets/rubin-imagotype/rubin-imagotype-color-on-white.svg`. The original imagotypes included a default margin. These new "crop" variants are cropped right to the art, so that the imagotype can align with other content in CSS/HTML layouts.

## 0.3.0 (2021-05-06)

- Added image assets from the Rubin Visual Identity, including imagotypes (full scale, intermediate, and favicon), watermarks, and partner logos. The full and intermediate-scale imagotypes in this distribution are additionally cropped so that the clearance corresponds to the desired "N" spacing.

  These files can be imported from the NPM package as regular static assets. Additionally, these assets are distributed in JSON files as Base 64-encoded strings.

- Support for theming with next-themes.

- Initial design tokens from components originating in the Squareone application (https://github.com/lsst-sqre/rsp-squareone).

- Fixed `color.green.500` to be the correct color from the Visual Identity Manual (previously it was the same as `color.purple.500`).

- Development dependencies:

- Updated lodash to 4.17.21
- Updated style-dictionary to 3.0.0-rc.8

## 0.2.1 (2021-02-17)

This version features a revised organization of design tokens:

- Global design tokens are abstract values taken from the Rubin Visual Identity Manual, such as colors.
- Component design tokens tie the global tokens to semantically relevant components, such as the color of text in a button.
- Component design tokens can be themed.

## 0.1.0 (2021-01-27)

This initial release of rubin-style-dictionary demonstrates how design tokens from the Rubin Visual Identity Manual can be encoded with Style Dictionary and exported to formats ready to use in applications.
