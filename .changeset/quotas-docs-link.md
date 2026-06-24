---
'squareone': minor
---

Add a "Learn more about quotas" documentation link to the `/settings/quotas` Lede. The link is composed from the existing `docsBaseUrl` config value via the `getDocsUrl` helper, so it resolves to the environment-appropriate variant of the RSP docs (default `https://rsp.lsst.io/guides/life/quotas.html`, e.g. `https://rsp.lsst.io/v/usdfprod/guides/life/quotas.html` on USDF). It opens in the same tab, matching the homepage notebooks docs link, and needs no new config key or Phalanx change.
