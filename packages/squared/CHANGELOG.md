# @lsst-sqre/squared

## 0.1.0

### Minor Changes

- [#155](https://github.com/lsst-sqre/squareone/pull/155) [`b765732`](https://github.com/lsst-sqre/squareone/commit/b765732db52e354026294fce7b5ef7c32d32e553) Thanks [@jonathansick](https://github.com/jonathansick)! - Add a useGafaelfawrUser hook.

- [#153](https://github.com/lsst-sqre/squareone/pull/153) [`9abbebb`](https://github.com/lsst-sqre/squareone/commit/9abbebba02fc1bc27fe2097fbbdb97110a9c93d9) Thanks [@jonathansick](https://github.com/jonathansick)! - This is the first release of the Squared React component library for Squareone.

- [#155](https://github.com/lsst-sqre/squareone/pull/155) [`30928a5`](https://github.com/lsst-sqre/squareone/commit/30928a5caa5392d7927fd3a2f017d48d77b68c1a) Thanks [@jonathansick](https://github.com/jonathansick)! - Add a GafaelfawrUserMenu component to squared. This is based on the Radix UI dropdown menu and implements a login button if the user is not authenticated or a full user settings menu if the user is authenticated. A logout menu item is always included at the end of the menu, but apps can compose other user menu items in the component. As the name implies, this component is tied into the logic and usage patterns of Gafaelfawr as an auth service.

- [#155](https://github.com/lsst-sqre/squareone/pull/155) [`30928a5`](https://github.com/lsst-sqre/squareone/commit/30928a5caa5392d7927fd3a2f017d48d77b68c1a) Thanks [@jonathansick](https://github.com/jonathansick)! - Add a useCurrentUrl hook. This works with `react/router` and a provided base URL to get the absolute URL of the current page view. Next.js is now a peer dependency of squared to support this.

### Patch Changes

- Updated dependencies [[`5ee421b`](https://github.com/lsst-sqre/squareone/commit/5ee421bdd8f1c6f922913028ad48284f941189f1)]:
  - @lsst-sqre/global-css@0.1.0
