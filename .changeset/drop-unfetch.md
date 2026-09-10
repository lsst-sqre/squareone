---
'@lsst-sqre/squared': patch
---

Drop the `unfetch` dependency. The `useGafaelfawrUser` hook was its only consumer and now uses the global `fetch` available in every supported browser and Node.js runtime.
