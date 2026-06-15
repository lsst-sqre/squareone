---
"squareone": patch
---

Add a "Read the documentation" link to each `/api-aspect` dataset section.

Each dataset's description blurb now ends with a visible "Read the documentation"
link to the dataset's own documentation site (for example DP1 links to
https://dp1.lsst.io), sourced from the Repertoire discovery `docs_url` field. The
link is rendered in the link color with a trailing external-link arrow so it reads
as a link without relying on color alone, and it carries an accessible label that
names the dataset (e.g. "Read the Data Preview 1 documentation"). The dataset
heading continues to link to the same docs URL; datasets without a `docs_url`
simply omit the link.
