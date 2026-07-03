---
'@lsst-sqre/times-square-client': patch
'squareone': patch
---

Fix Times Square dev mock API routes that had drifted from the real API: leaf nodes in the GitHub contents-tree mocks now include the required empty `contents` array, and the page-metadata mocks return the full `Page` shape (formatted-text `description`, `date_added`, `uploader_username`, `html_events_url`, `github`). New schema-conformance tests parse every JSON mock route with the Zod schemas from `@lsst-sqre/times-square-client`, and the Times Square v0.24.0 OpenAPI spec is vendored in the package as the reference for those schemas.
