# squareone

## 0.18.0

### Minor Changes

- [#179](https://github.com/lsst-sqre/squareone/pull/179) [`92ecf5f`](https://github.com/lsst-sqre/squareone/commit/92ecf5f1b3d4e509552e1cb724cfb8dfd63efa45) Thanks [@jonathansick](https://github.com/jonathansick)! - Add a configurable Apps menu to the header navigation. This menu is for linking for non-aspect applications within the RSP, such as Times Square.

- [#179](https://github.com/lsst-sqre/squareone/pull/179) [`b4b2fdb`](https://github.com/lsst-sqre/squareone/commit/b4b2fdb72ea42adf3142ee53bdb463e9bfebe441) Thanks [@jonathansick](https://github.com/jonathansick)! - Moved auth URLs into Squared as a library. The `getLoginUrl` and `getLogout` URL functions compute the full URLs to the RSP's login and logout endpoints and include the `?rd` query strings to return the user to current and home URL respectively.

- [#179](https://github.com/lsst-sqre/squareone/pull/179) [`6be6b1c`](https://github.com/lsst-sqre/squareone/commit/6be6b1c5229444e293d0d1e84a263c499202934d) Thanks [@jonathansick](https://github.com/jonathansick)! - Reimplement `HeaderNav` using the `PrimaryNavigation` component from Squared. Although the menu looks the same visually, it is now entirely powered by the Radix `NavigationMenu` primitive so that any menu item can be a trigger for a menu rather than a link to another page. The Login / user menu is reimplemented as a menu item rather than with the special GafaelfawrUserMenu component.

### Patch Changes

- Updated dependencies [[`b4b2fdb`](https://github.com/lsst-sqre/squareone/commit/b4b2fdb72ea42adf3142ee53bdb463e9bfebe441), [`77274e7`](https://github.com/lsst-sqre/squareone/commit/77274e7a144158ac267f4b38a1e7dc48cb10f2de)]:
  - @lsst-sqre/squared@0.4.0

## 0.17.0

### Minor Changes

- [#175](https://github.com/lsst-sqre/squareone/pull/175) [`9cadf35`](https://github.com/lsst-sqre/squareone/commit/9cadf358e89410e475222e8a76a9e20056cf6119) Thanks [@jonathansick](https://github.com/jonathansick)! - The Times Square UI now closes its connection to the `/times-square/pages/:page/html/events?<qs>` SSE endpoint once the page instance's execution status is "complete" and the HTML hash is computed. With this change, the Times Square UI reduces its ongoing load on the API and also reduces network usage. The HTML page will still update to the latest version because the iframe component pings the Times Square `pages/:page/htmlstatus?<qs>` endpoint. We may back this off or convert the page update to an opt-in future in the future to further reduce network and API load from the front-end.

## 0.16.0

### Minor Changes

- [#176](https://github.com/lsst-sqre/squareone/pull/176) [`8e5b789`](https://github.com/lsst-sqre/squareone/commit/8e5b789ab0b4c591cca1f42db0e6cf773d8b0ccc) Thanks [@fajpunk](https://github.com/fajpunk)! - Added Sentry instrumentation to the `squareone` app.

  Both the NextJS client (frontend) and server (backend) code are instrumented with the official [Sentry NextJS integration](https://docs.sentry.io/platforms/javascript/guides/nextjs/). The Sentry DSN should be provided in a `SENTRY_DSN` environment variable. If a Sentry DSN is not provided, there will be no changes to app behaviour. If a Sentry DSN is provided, then these things will be sent to Sentry:

  - Any uncaught exceptions and error-level logs
  - Traces for user interaction (according to the sample settings)
  - Session replays for user interaction (according to the sample settings)

  There are new config file options for Sentry configuration:

  - `sentryTracesSampleRate`
  - `sentryReplaysSessionSampleRate`
  - `sentryReplaysOnErrorSampleRate`
  - `sentryDebug`

  There is a new route, `/sentry-example-page` which provides a way to quickly check that the Sentry integration is working.

## 0.15.0

### Minor Changes

- [#173](https://github.com/lsst-sqre/squareone/pull/173) [`c5dac7f`](https://github.com/lsst-sqre/squareone/commit/c5dac7ff7b8846e665918b32a7fdac8193615dfd) Thanks [@jonathansick](https://github.com/jonathansick)! - The Times Square interface now includes a link to its user documentation. The root of the environment-specific rsp.lsst.io site is configured through the new `docsBaseUrl` configuration parameter.

- [#173](https://github.com/lsst-sqre/squareone/pull/173) [`c5dac7f`](https://github.com/lsst-sqre/squareone/commit/c5dac7ff7b8846e665918b32a7fdac8193615dfd) Thanks [@jonathansick](https://github.com/jonathansick)! - Migrated Squareone CSS custom properties / design tokens to global-css from the globals.css file in the Squareone app

  With this change, any app as well as the Squared component library can use CSS custom properties such as the elevations (box-shadows, e.g. `--sqo-elevation-md`) and transitions (`--sqo-transition-basic`) that are included as global CSS custom properties.

### Patch Changes

- Updated dependencies [[`c5dac7f`](https://github.com/lsst-sqre/squareone/commit/c5dac7ff7b8846e665918b32a7fdac8193615dfd), [`c5dac7f`](https://github.com/lsst-sqre/squareone/commit/c5dac7ff7b8846e665918b32a7fdac8193615dfd)]:
  - @lsst-sqre/squared@0.3.0
  - @lsst-sqre/global-css@0.2.0

## 0.14.0

### Minor Changes

- [#171](https://github.com/lsst-sqre/squareone/pull/171) [`55ff9ab`](https://github.com/lsst-sqre/squareone/commit/55ff9ab52dc86c3b47f5ac4ca2fb5fc84d9ff15b) Thanks [@jonathansick](https://github.com/jonathansick)! - Add support for Plausible.io analytics

  In Squareone, set the `plausibleDomain` configuration to the Plausible tracking domain. E.g. data.lsst.cloud for the RSP. To disable Plausible tracking where it isn't supported, set this configuration to `null`.

## 0.13.1

### Patch Changes

- [#169](https://github.com/lsst-sqre/squareone/pull/169) [`c4eeb75`](https://github.com/lsst-sqre/squareone/commit/c4eeb75c85f290165313c2f9a7bc4cd814710a6c) Thanks [@jonathansick](https://github.com/jonathansick)! - Change "Account settings" menu item to title case.

## 0.13.0

### Minor Changes

- [#166](https://github.com/lsst-sqre/squareone/pull/166) [`157d03d`](https://github.com/lsst-sqre/squareone/commit/157d03db4fe3e559dc0071c1a1567200d376e1be) Thanks [@jonathansick](https://github.com/jonathansick)! - Usage of Reach UI is now removed and replaced with Radix UI. The user menu now uses `GafaelfawrUserMenu` from `@lsst-sqre/squared` and is based on Radix UI's Navigation Menu component. It is customized here to work with the Gafaelawr API to show a log in button for the logged out state, and to show the user's menu with a default log out button for the logged in state. Previously we also used Reach UI for showing an accessible validation alert in the Times Square page parameters UI. For now we've dropped this functionality.

### Patch Changes

- Updated dependencies [[`157d03d`](https://github.com/lsst-sqre/squareone/commit/157d03db4fe3e559dc0071c1a1567200d376e1be), [`f403ffd`](https://github.com/lsst-sqre/squareone/commit/f403ffd461983a579614d1ae4aa2c4b42537c294)]:
  - @lsst-sqre/squared@0.2.0

## 0.12.0

### Minor Changes

- [#164](https://github.com/lsst-sqre/squareone/pull/164) [`0574c00`](https://github.com/lsst-sqre/squareone/commit/0574c00b63b49418a35b95379f05e291848d667e) Thanks [@jonathansick](https://github.com/jonathansick)! - Users can now download the Jupyter Notebook (ipynb) file that they are viewing, with the current parameters filled in. This enables further interactive exploration.

- [#164](https://github.com/lsst-sqre/squareone/pull/164) [`2adb0af`](https://github.com/lsst-sqre/squareone/commit/2adb0af63bb1a69e59f68a33a1a31bdf30899bb2) Thanks [@jonathansick](https://github.com/jonathansick)! - Times Square notebook pages show a link to the source notebook on GitHub.

## 0.11.0

### Minor Changes

- [#153](https://github.com/lsst-sqre/squareone/pull/153) [`3561d09`](https://github.com/lsst-sqre/squareone/commit/3561d097d0c5cbe508f140f2bcd9041a540832a0) Thanks [@jonathansick](https://github.com/jonathansick)! - Squareone uses a base stylesheet from the @lsst-sqre/global-css package. This reduces the amount of global CSS managed in Squareone itself, and offloads configuring the Rubin Style Dictionary tokens into base CSS elements.

- [#163](https://github.com/lsst-sqre/squareone/pull/163) [`72dd989`](https://github.com/lsst-sqre/squareone/commit/72dd989ad963612204fa92a484a56abfbed4df8a) Thanks [@jonathansick](https://github.com/jonathansick)! - Implement background recomputation for cached Times Square pages. The "Recompute" button submits a request to Times Square's `DELETE /v1/pages/:page/html?{params}` endpoint, which causes a background recomputation of the notebook and re-rendering of the cached HTML.

  The new `TimesSquareHtmlEventsProvider` is a React context provider that provides real-time updates from Times Square about the status of an HTML rendering for a given set of parameters using Times Square's `/v1/pages/:page/html/events/{params}` endpoint. Squareone uses `@microsoft/fetch-event-source` to subscribe to this server-sent events (SSE) endpoint. Using this provider, the UI is able to show new data to the user, including the status of the computation, and once the computation is complete, the date/age of computation and the execution time.

- [#163](https://github.com/lsst-sqre/squareone/pull/163) [`72dd989`](https://github.com/lsst-sqre/squareone/commit/72dd989ad963612204fa92a484a56abfbed4df8a) Thanks [@jonathansick](https://github.com/jonathansick)! - The Times Square "Update" and "Reset" buttons are now disabled when appropriate. The Update button is disabled when the parameter inputs have not been changed relative to their current state. Likewise, the Reset button is disabled when the parameters are unchanged from the current state.

- [#153](https://github.com/lsst-sqre/squareone/pull/153) [`1240924`](https://github.com/lsst-sqre/squareone/commit/124092414c191eb16866304eafd9b6c4d428e2f6) Thanks [@jonathansick](https://github.com/jonathansick)! - Drop the use of normalize.css and instead rely on the base CSS from the global-css package.

- [#163](https://github.com/lsst-sqre/squareone/pull/163) [`72dd989`](https://github.com/lsst-sqre/squareone/commit/72dd989ad963612204fa92a484a56abfbed4df8a) Thanks [@jonathansick](https://github.com/jonathansick)! - New `TimesSquareUrlParametersProvider` component. This React context provides the URL-based state to Times Square components, such as the page being viewed, its notebook parameters values, and the display settings. This change simplifies the structure of the React pages by refactoring all of the URL parsing into a common component. As well, this context eliminates "prop drilling" to provide this URL-based state to all components in the Times Square application.

### Patch Changes

- Updated dependencies [[`b765732`](https://github.com/lsst-sqre/squareone/commit/b765732db52e354026294fce7b5ef7c32d32e553), [`5ee421b`](https://github.com/lsst-sqre/squareone/commit/5ee421bdd8f1c6f922913028ad48284f941189f1), [`9abbebb`](https://github.com/lsst-sqre/squareone/commit/9abbebba02fc1bc27fe2097fbbdb97110a9c93d9), [`30928a5`](https://github.com/lsst-sqre/squareone/commit/30928a5caa5392d7927fd3a2f017d48d77b68c1a), [`30928a5`](https://github.com/lsst-sqre/squareone/commit/30928a5caa5392d7927fd3a2f017d48d77b68c1a)]:
  - @lsst-sqre/squared@0.1.0
  - @lsst-sqre/global-css@0.1.0

## 0.10.3

### Patch Changes

- [#150](https://github.com/lsst-sqre/squareone/pull/150) [`1bcd1a4`](https://github.com/lsst-sqre/squareone/commit/1bcd1a45610f64eeb88ebd4c49572a679b0767a5) Thanks [@jonathansick](https://github.com/jonathansick)! - The squareone Docker image release is now triggered by a GitHub Release being published.

## 0.10.2

### Patch Changes

- [#148](https://github.com/lsst-sqre/squareone/pull/148) [`0e4d392`](https://github.com/lsst-sqre/squareone/commit/0e4d392afafe8437f39af3018ecf47d4a76567a2) Thanks [@jonathansick](https://github.com/jonathansick)! - Tweaks to the release process:

  - Use a custom GITHUB_TOKEN for the changesets/action in order to trigger the Docker release workflow for Squareone.

- Updated dependencies [[`0e4d392`](https://github.com/lsst-sqre/squareone/commit/0e4d392afafe8437f39af3018ecf47d4a76567a2)]:
  - @lsst-sqre/rubin-style-dictionary@0.4.2

## 0.10.1

### Patch Changes

- [#143](https://github.com/lsst-sqre/squareone/pull/143) [`13e6f4c`](https://github.com/lsst-sqre/squareone/commit/13e6f4c4415e913665dd8922c0e079dd0fefe7ba) Thanks [@jonathansick](https://github.com/jonathansick)! - Migrated lsst-sqre/squareone into a turbo-based monorepo. Rubin Style Dictionary is now a package inside the monorepo.
- Migrated to `pnpm` from `npm` for package management.
- Upgrade to Storybook 7.
- Add development set up documentation to the squareone.lsst.io site.

- Updated dependencies [[`13e6f4c`](https://github.com/lsst-sqre/squareone/commit/13e6f4c4415e913665dd8922c0e079dd0fefe7ba)]:
  - @lsst-sqre/rubin-style-dictionary@0.4.1

## 0.10.0 (2023-03-27)

### New features

- Add new pages for the COmanage sign-up flow. The content for these pages is configurable via [MDX](https://mdxjs.com) fields in `squareone.config.yaml`:

  - `verifyEmailPageMdx` for `/enrollment/thanks-for-signing-up`
  - `emailVerifiedPageMdx` for `/enrollment/thanks-for-verifying`
  - `pendingApprovalPageMdx` for `/enrollment/pending-approval`
  - `pendingVerificationPageMdx` for `/enrollment/pending-confirmation`

- Other pages' content are now configurable with MDX:

  - `apiAspectPageMdx` for `/api-aspect`
  - `docsPageMdx` for `/docs`
  - `supportPageMdx` for `/support`

## 0.9.0 (2023-03-01)

### New features

- Display an "Account settings" link in the user menu that goes to the COmanage Registry. This registry URL, which is optional, can be configured in `squareone.config.yaml` with the `coManageRegistryUrl` field.

## 0.8.1 (2022-08-25)

### Bug fixes

- Improved UI for Times pull request preview pages.

### Development changes

- Added additional stories and integration with Chromatic, the hosted Storybook service.

## 0.8.0 (2022-08-18)

### New features

- New pages for Times Square to preview pages in GitHub pull requests at `/times-square/github-pr/:owner/:repo:/:commit` paths.

### Development changes

- Initial integration with Storybook for designing and documenting components within Squareone.

## 0.7.1 (2022-06-26)

### Bug fixes

- Link to DP0.2 documentation.

## 0.7.0 (2022-06-23)

### New features

- Add initial support for [Times Square](https://github.com/lsst-sqre/times-square).
- Update background image for the homepage hero component to a new image by Bruno Quint, taken September 2021.

### Development changes

- Refresh dependencies.

## 0.6.0 (2022-04-14)

### New features

- Informational broadcast messages are now displayed with Rubin's primary teal as the background color (see [lsst-sqre/semaphore#29](https://github.com/lsst-sqre/semaphore/pull/29) for more information).
- Replaced custom fetch hook for the Semaphore broadcast message data with swr, enabling us to automatically refresh broadcast data.
- Updated the component layout in the source code.

## 0.5.0 (2022-04-06)

### New features

- Squareone is cross-published on the GitHub Container Registry at `ghcr.io/lsst-sqre/squareone`.

### Bug fixes

- Fix minor UI issues, including unnecessary scrollbars in the broadcast message disclosures and `Link` usage.
- Remove the note on the documentation page about Generation 3 middleware.

### Development changes

- Upgrade to Next 12 and various upgrades of dependencies and linting tools.
- Upgrade to Node 16.

## 0.4.0 (2021-08-11)

### New features

- Broadcast messages are now sourced through `Semaphore <https://github/lsst-sqre/semaphore>`_, a service that is installed in the science platform and sources messages from GitHub. With this update, messages can also have additional information that is visible if a user clicks on a "Read more" button. This disclosure is powered by `react-a11y-disclosure <https://github.com/KittyGiraudel/react-a11y-disclosure>`_.

- There is a new configuration field, `semaphoreUrl`, to configure the root URL for the Semaphore API service. The `broadcastMarkdown` field is removed.

## 0.3.1 (2021-08-04)

### Bug fixes

- Update funding text.

### Development changes

- Refresh README with status badges and revise text on git hooks.

## 0.3.0 (2021-07-12)

### New features

- Add a broadcastMarkdown configuration field to the public configuration schema. If set, this content is shown in a new BroadcastBanner component on any page. This is a configuration-driven way of displaying notifications to users without requiring code changes. The semaphore application will add further flexibility for pushing notifications in the future.

### Bug fixes

- Fix the name of the GitHub repository for support on the `/support` page.

## 0.2.2 (2021-06-25)

### Bug fixes

- Revised capitalization in the Acceptable Use Policy.

## 0.2.1 (2021-06-24)

### Bug fixes

- Add description on how to use the auth token with TAP clients that rely on basic authentication (username and password).

## 0.2.0 (2021-06-24)

### New features

This release includes many features in preparation for DP0.1:

- New `/docs` page that links to data, service, and software documentation relevant to RSP users.
- New `/api`-aspect page that provides information about how to access the TAP API.
- New `/terms` page that includes the RSP Acceptable Use Policy
- New `/support` page that describes how to get support.

### Bug fixes

- Fix open graph metadata

## 0.1.5 (2021-05-06)

### Bug fixes

- Update funding agency text and logos to the operations era.

## 0.1.4 (2021-05-03)

### Bug fixes

- Fix CSS loading for the UserMenu component by adding the babel styled-components plugin.
- Change the UserMenu component to display the username rather than the user's name, as Gafaelfawr does not guarantee the "name" property is available.
- Switch to Font Source for the Source Sans font (from Google Fonts).
- Remove temporary content from the index page.

## 0.1.3 (2021-04-05)

### Bug fixes

- Fix hero links for Portal and Notebooks
- Enable links in nav bar
- Enable documentation links

## 0.1.2 (2021-04-05)

### Bug fixes

- Fix how the configuration path is computed.

## 0.1.1 (2021-04-05)

### Bug fixes

- This release adds next.config.js to the Docker image.

## 0.1.0 (2021-03-30)

### New features

This is the first development release of Squareone! 🎉
