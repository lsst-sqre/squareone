---
'@lsst-sqre/repertoire-client': minor
---

`useServiceDiscovery` now returns `isFetching`, which is `true` whenever a discovery fetch is in flight, including a `refetch` of a document that has already loaded (`isPending` is only `true` until the first document loads).

In the browser, the discovery query no longer answers from `fetchServiceDiscovery`'s module-level cache, which exists to share discovery across server requests. TanStack Query is the browser's cache, so a `refetch` now always requests the document from Repertoire instead of returning the cached copy for up to 5 minutes. Server-side fetches still use the module-level cache.
