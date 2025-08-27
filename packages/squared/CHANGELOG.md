# @lsst-sqre/squared

## 0.8.0

### Minor Changes

- [#200](https://github.com/lsst-sqre/squareone/pull/200) [`279dbcb6352839f434a729cccdd9d12f74cf7eac`](https://github.com/lsst-sqre/squareone/commit/279dbcb6352839f434a729cccdd9d12f74cf7eac) Thanks [@jonathansick](https://github.com/jonathansick)! - Upgrade MSW (Mock Service Worker) to version 2.10.5

  This is a major version upgrade from MSW 1.x to 2.x, which includes:

  - Breaking changes in API and configuration
  - Updated request/response handling
  - New testing utilities and Storybook integration
  - Improved TypeScript support

  This upgrade affects mocking capabilities in Storybook stories and may require updates to mock configurations.

- [#200](https://github.com/lsst-sqre/squareone/pull/200) [`279dbcb6352839f434a729cccdd9d12f74cf7eac`](https://github.com/lsst-sqre/squareone/commit/279dbcb6352839f434a729cccdd9d12f74cf7eac) Thanks [@jonathansick](https://github.com/jonathansick)! - Upgrade Next.js to version 15.5.0

  This is a major version upgrade from Next.js 14.x to 15.5.0, which includes:

  - New App Router improvements and features (although Squareone remains on the pages router)
  - Breaking changes in build system and runtime behavior (turbopack)
  - Updated instrumentation configuration
  - Performance improvements

  This upgrade may require configuration updates in consuming applications.

- [#200](https://github.com/lsst-sqre/squareone/pull/200) [`279dbcb6352839f434a729cccdd9d12f74cf7eac`](https://github.com/lsst-sqre/squareone/commit/279dbcb6352839f434a729cccdd9d12f74cf7eac) Thanks [@jonathansick](https://github.com/jonathansick)! - Upgrade Node.js to version 22.13.0 LTS

  Updated the Node.js runtime requirement from 18.x to 22.x LTS, which includes:

  - Latest LTS stability and security improvements
  - Updated build toolchain and CI environment
  - Improved performance and new language features

  This change updates the development environment and deployment requirements.

- [#200](https://github.com/lsst-sqre/squareone/pull/200) [`279dbcb6352839f434a729cccdd9d12f74cf7eac`](https://github.com/lsst-sqre/squareone/commit/279dbcb6352839f434a729cccdd9d12f74cf7eac) Thanks [@jonathansick](https://github.com/jonathansick)! - Upgrade React to version 19.1.1

  This is a major version upgrade from React 18.x to React 19.1.1, which includes:

  - New React 19 features and improvements
  - Updated TypeScript types for React 19
  - Breaking changes that may affect consumers

  This upgrade requires peer dependency updates in consuming applications.

- [#200](https://github.com/lsst-sqre/squareone/pull/200) [`279dbcb6352839f434a729cccdd9d12f74cf7eac`](https://github.com/lsst-sqre/squareone/commit/279dbcb6352839f434a729cccdd9d12f74cf7eac) Thanks [@jonathansick](https://github.com/jonathansick)! - Upgrade Storybook to version 9.1.3

  This is a major version upgrade from Storybook 7.x to 9.1.3, which includes:

  - New Storybook 9 features and testing capabilities
  - Updated addon ecosystem and configuration
  - Breaking changes in story format and testing utilities
  - Improved performance and build system
  - Migration from deprecated addons to new alternatives

  This upgrade includes configuration changes and may require story updates in consuming projects.

### Patch Changes

- [#200](https://github.com/lsst-sqre/squareone/pull/200) [`279dbcb6352839f434a729cccdd9d12f74cf7eac`](https://github.com/lsst-sqre/squareone/commit/279dbcb6352839f434a729cccdd9d12f74cf7eac) Thanks [@jonathansick](https://github.com/jonathansick)! - Fix build system and Storybook compatibility issues

  - Fix Turbo build outputs configuration for better caching
  - Add explicit React imports to Storybook files for CI compatibility
  - Fix ESLint compatibility with Turbo 2.5.6
  - Resolve Docker build corepack signature errors
  - Update build timeouts and pass required environment variables

  These changes improve build reliability and resolve compatibility issues in CI environments.

## 0.7.0

### Minor Changes

- [#197](https://github.com/lsst-sqre/squareone/pull/197) [`2b7c98f0bd660714e7f0c50635277664723f4fd5`](https://github.com/lsst-sqre/squareone/commit/2b7c98f0bd660714e7f0c50635277664723f4fd5) Thanks [@jonathansick](https://github.com/jonathansick)! - Fixed PrimaryNavigation DOM structure for Next.js 13+ compatibility and improved accessibility.

- [#197](https://github.com/lsst-sqre/squareone/pull/197) [`2b7c98f0bd660714e7f0c50635277664723f4fd5`](https://github.com/lsst-sqre/squareone/commit/2b7c98f0bd660714e7f0c50635277664723f4fd5) Thanks [@jonathansick](https://github.com/jonathansick)! - Changed typing style to use `type` rather than `interface` for consistency.

## 0.6.0

### Minor Changes

- [`b41e337e5517caa3332ad78d5ee62fc96d1f13fc`](https://github.com/lsst-sqre/squareone/commit/b41e337e5517caa3332ad78d5ee62fc96d1f13fc) Thanks [@jonathansick](https://github.com/jonathansick)! - Update to Next 13.5

- [`4129cd39404ff5d14cd3716fbd526839f851b50e`](https://github.com/lsst-sqre/squareone/commit/4129cd39404ff5d14cd3716fbd526839f851b50e) Thanks [@jonathansick](https://github.com/jonathansick)! - Migrate components to use transitive props for styled-components.

## 0.5.0

### Minor Changes

- [#192](https://github.com/lsst-sqre/squareone/pull/192) [`50d8d1f6cfef0318cb6c2767ba4feda8e120e348`](https://github.com/lsst-sqre/squareone/commit/50d8d1f6cfef0318cb6c2767ba4feda8e120e348) Thanks [@jonathansick](https://github.com/jonathansick)! - Migrate to React 18.3.1

  - Updated React from 17.0.2 to 18.3.1 across all packages
  - Updated React DOM to 18.3.1 for improved hydration and performance
  - Updated TypeScript types for React 18 compatibility
  - Updated styled-components to v5.3.11 for React 18 support
  - Updated Storybook React dependencies for compatibility

## 0.4.2

### Patch Changes

- Updated dependencies [[`7a41984e02439cd16a2786196330492197f5c465`](https://github.com/lsst-sqre/squareone/commit/7a41984e02439cd16a2786196330492197f5c465)]:
  - @lsst-sqre/rubin-style-dictionary@0.5.1
  - @lsst-sqre/global-css@0.2.2

## 0.4.1

### Patch Changes

- Updated dependencies [[`9b717643a038f3936f520c2f85dfaa2d7ad2b0d3`](https://github.com/lsst-sqre/squareone/commit/9b717643a038f3936f520c2f85dfaa2d7ad2b0d3), [`1323de7a7e4deb3ada11ebbf650883c70221958f`](https://github.com/lsst-sqre/squareone/commit/1323de7a7e4deb3ada11ebbf650883c70221958f)]:
  - @lsst-sqre/rubin-style-dictionary@0.5.0
  - @lsst-sqre/global-css@0.2.1

## 0.4.0

### Minor Changes

- [#179](https://github.com/lsst-sqre/squareone/pull/179) [`b4b2fdb`](https://github.com/lsst-sqre/squareone/commit/b4b2fdb72ea42adf3142ee53bdb463e9bfebe441) Thanks [@jonathansick](https://github.com/jonathansick)! - Moved auth URLs into Squared as a library. The `getLoginUrl` and `getLogout` URL functions compute the full URLs to the RSP's login and logout endpoints and include the `?rd` query strings to return the user to current and home URL respectively.

- [#179](https://github.com/lsst-sqre/squareone/pull/179) [`77274e7`](https://github.com/lsst-sqre/squareone/commit/77274e7a144158ac267f4b38a1e7dc48cb10f2de) Thanks [@jonathansick](https://github.com/jonathansick)! - Add a new PrimaryNavigation component. This component uses the Radix [NavigationMenu](https://www.radix-ui.com/primitives/docs/components/navigation-menu) primitive and is intended to be a comprehensive solution for the primary navigation in the header of Squareone. The earlier `GafaelfawrUserMenu` component in Squared also uses `NavigationMenu`, but as a single item. With `PrimaryNavigation`, the functionality of `GafaelfawrUserMenu` can be composed into an instance of `PrimaryNavigation`. Like `GafaelfawrMenu`, `PrimaryNavigation` is set up so that menus only appear after clicking on a trigger, rather than on hover. As well, `PrimaryNavigation` ensures the menu is proximate to the trigger (an improvement on the default `NavigationMenu` functionality that centers the menu below the whole navigation element.

## 0.3.0

### Minor Changes

- [#173](https://github.com/lsst-sqre/squareone/pull/173) [`c5dac7f`](https://github.com/lsst-sqre/squareone/commit/c5dac7ff7b8846e665918b32a7fdac8193615dfd) Thanks [@jonathansick](https://github.com/jonathansick)! - Added a new component, `IconPill`. This component creates an inline pill that acts as a link button. The contents of the pill are an easy-to-configure icon from FontAwesome alongside text. The colours of the pill are configurable by props, but by default the pill looks similar to to the button component.

### Patch Changes

- Updated dependencies [[`c5dac7f`](https://github.com/lsst-sqre/squareone/commit/c5dac7ff7b8846e665918b32a7fdac8193615dfd)]:
  - @lsst-sqre/global-css@0.2.0

## 0.2.0

### Minor Changes

- [#166](https://github.com/lsst-sqre/squareone/pull/166) [`157d03d`](https://github.com/lsst-sqre/squareone/commit/157d03db4fe3e559dc0071c1a1567200d376e1be) Thanks [@jonathansick](https://github.com/jonathansick)! - Created GafaelfawrUserMenu based on the Radix UI [navigation-menu](https://www.radix-ui.com/primitives/docs/components/navigation-menu) component. That's the right primitive for an accessible menu that uses `<a>` or Next `Link` elements. The existing Gafaelfawr menu is now `GafaelfawrUserDropdown` for reference (it is based on Radix UI's [dropdown menu](https://www.radix-ui.com/primitives/docs/components/dropdown-menu), but is more appropriate as a menu of buttons.

- [#168](https://github.com/lsst-sqre/squareone/pull/168) [`f403ffd`](https://github.com/lsst-sqre/squareone/commit/f403ffd461983a579614d1ae4aa2c4b42537c294) Thanks [@jonathansick](https://github.com/jonathansick)! - Disable opening and closing the GafaelfawrUserMenu on hover. This is a better UX because it allows for less precise mousing when using the menu.

## 0.1.0

### Minor Changes

- [#155](https://github.com/lsst-sqre/squareone/pull/155) [`b765732`](https://github.com/lsst-sqre/squareone/commit/b765732db52e354026294fce7b5ef7c32d32e553) Thanks [@jonathansick](https://github.com/jonathansick)! - Add a useGafaelfawrUser hook.

- [#153](https://github.com/lsst-sqre/squareone/pull/153) [`9abbebb`](https://github.com/lsst-sqre/squareone/commit/9abbebba02fc1bc27fe2097fbbdb97110a9c93d9) Thanks [@jonathansick](https://github.com/jonathansick)! - This is the first release of the Squared React component library for Squareone.

- [#155](https://github.com/lsst-sqre/squareone/pull/155) [`30928a5`](https://github.com/lsst-sqre/squareone/commit/30928a5caa5392d7927fd3a2f017d48d77b68c1a) Thanks [@jonathansick](https://github.com/jonathansick)! - Add a GafaelfawrUserMenu component to squared. This is based on the Radix UI dropdown menu and implements a login button if the user is not authenticated or a full user settings menu if the user is authenticated. A logout menu item is always included at the end of the menu, but apps can compose other user menu items in the component. As the name implies, this component is tied into the logic and usage patterns of Gafaelfawr as an auth service.

- [#155](https://github.com/lsst-sqre/squareone/pull/155) [`30928a5`](https://github.com/lsst-sqre/squareone/commit/30928a5caa5392d7927fd3a2f017d48d77b68c1a) Thanks [@jonathansick](https://github.com/jonathansick)! - Add a useCurrentUrl hook. This works with `react/router` and a provided base URL to get the absolute URL of the current page view. Next.js is now a peer dependency of squared to support this.

### Patch Changes

- Updated dependencies [[`5ee421b`](https://github.com/lsst-sqre/squareone/commit/5ee421bdd8f1c6f922913028ad48284f941189f1)]:
  - @lsst-sqre/global-css@0.1.0
