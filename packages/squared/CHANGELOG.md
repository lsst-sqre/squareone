# @lsst-sqre/squared

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
