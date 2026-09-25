---
'squareone': minor
---

MDX content can now link to a user-facing service's URL from Repertoire service discovery with a new `<ServiceLink service="…">` component, instead of hardcoding each environment's host. For example, `<ServiceLink service="comanage" />` links to the COmanage account settings (`services.ui.comanage`), with the URL, minus its trailing slash, as the link text (such as `https://id-dev.lsst.cloud` on idfdev). Content inside the tag becomes the link text instead, as in `<ServiceLink service="comanage">account settings</ServiceLink>`, and `variant="cta"` renders the link as a call-to-action button, like `<CtaLink>`. The component is available to every MDX page (`/settings`, `/support`, `/docs`, `/api-aspect`, and the enrollment pages) and to the footer.

When `repertoireUrl` isn't set, the Repertoire API is unavailable, or discovery doesn't list the service, no link renders and the page still renders: content inside the tag renders as plain text, while a self-closing tag or a `variant="cta"` link renders nothing. Discovery failures are logged and outages are reported to Sentry, and all the links on a page share one discovery request.

The development `settings__index.mdx` now links to the discovered COmanage URL, replacing its `https://example.com/registry` placeholder. In deployments, `/settings` content comes from each environment's `settings__index.mdx` in Phalanx, which can switch its hardcoded COmanage links to `<ServiceLink service="comanage" />`.
