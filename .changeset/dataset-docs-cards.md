---
'squareone': minor
---

The `/docs` page's MDX can now list the datasets from Repertoire service discovery with a new `<DatasetDocsCards>` component, instead of hand-written data preview cards. It renders one card per discovered dataset, with the newest release first and Prompt Products second. Each card shows the dataset's name (for example "Data Preview 1" for `dp1`, or the raw key for a dataset Squareone doesn't name), its discovery `description`, and a link to its discovery `docs_url`. A dataset without a `docs_url`, such as `prompt` on data-dev, gets a card with no link. Put the section heading on its own line between `<DatasetDocsCards>` and `</DatasetDocsCards>`, so that the heading is left out with the cards when `repertoireUrl` isn't set. If the Repertoire API is unavailable, the heading renders with a brief notice instead. Discovery is fetched for this page only when its content uses the component.

The development `docs.mdx` now uses `<DatasetDocsCards>` in place of its four hardcoded data preview cards. In deployments, `/docs` content comes from each environment's `docs.mdx` in Phalanx, so an environment shows the discovery-driven cards once its Phalanx `docs.mdx` switches to `<DatasetDocsCards>`. Until then its hand-written cards keep rendering as before.
