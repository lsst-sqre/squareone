##########
Change log
##########

0.4.0 (2021-08-11)
==================

- Broadcast messages are now sourced through `Semaphore <https://github/lsst-sqre/semaphore>`_, a service that is installed in the science platform and sources messages from GitHub.
  With this update, messages can also have additional information that is visible if a user clicks on a "Read more" button.
  This disclosure is powered by `react-a11y-disclosure <https://github.com/KittyGiraudel/react-a11y-disclosure>`_.

- There is a new configuration field, ``semaphoreUrl``, to configure the root URL for the Semaphore API service.
  The ``broadcastMarkdown`` field is removed.

0.3.1 (2021-08-04)
==================

- Update funding text.

- Refresh README with status badges and revise text on git hooks.

0.3.0 (2021-07-12)
==================

- Add a broadcastMarkdown configuration field to the public configuration schema.
  If set, this content is shown in a new BroadcastBanner component on any page.
  This is a configuration-driven way of displaying notifications to users without requiring code changes.
  The semaphore application will add further flexibility for pushing notifications in the future.

- Fix the name of the GitHub repository for support on the ``/support`` page.

0.2.2 (2021-06-25)
==================

This release revises capitalization in the Acceptable Use Policy.

0.2.1 (2021-06-24)
==================

This release describes how to use the auth token with TAP clients that rely on basic authentication (username and password).

0.2.0 (2021-06-24)
==================

This release includes many features in preparation for DP0.1:

- New ``/docs`` page that links to data, service, and software documentation relevant to RSP users.
- New ``/api``-aspect page that provides information about how to access the TAP API.
- New ``/terms`` page that includes the RSP Acceptable Use Policy
- New ``/support`` page that describes how to get support.
- Fix open graph metadata

0.1.5 (2021-05-06)
==================

- Update funding agency text and logos to the operations era.

0.1.4 (2021-05-03)
==================

- Fix CSS loading for the UserMenu component by adding the babel styled-components plugin.
- Change the UserMenu component to display the username rather than the user's name, as Gafaelfawr does not guarantee the "name" property is available.
- Switch to Font Source for the Source Sans font (from Google Fonts).
- Remove temporary content from the index page.

0.1.3 (2021-04-05)
==================

- Fix hero links for Portal and Notebooks
- Enable links in nav bar
- Enable documentation links

0.1.2 (2021-04-05)
==================

- Fix how the configuration path is computed.

0.1.1 (2021-04-05)
==================

- This release adds next.config.js to the Docker image.

0.1.0 (2021-03-30)
==================

This is the first development release of Squareone! 🎉
