---
'@lsst-sqre/squared': patch
---

`useGafaelfawrUser` is deprecated in favour of `useUserInfo` from `@lsst-sqre/gafaelfawr-client`. The squared hook makes its own SWR request to a fixed `/auth/api/v1/user-info` path, so it cannot share, or be server-rendered from, the TanStack Query user-info entry an app prefetches and hydrates. It remains exported for now.
