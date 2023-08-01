# Change log

## Unreleased

### Other changes

- Migrated to `pnpm` from `npm` for package management.
- Upgrade to Storybook 7.
- Add development set up documentation to the squareone.lsst.io site.

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
