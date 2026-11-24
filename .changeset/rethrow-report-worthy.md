---
'@lsst-sqre/api-client-core': minor
'@lsst-sqre/gafaelfawr-client': minor
'@lsst-sqre/repertoire-client': minor
'@lsst-sqre/semaphore-client': minor
---

Add a `rethrowReportWorthy` option so a server-side prefetch never hydrates an outage

`reportingQueryFn` has a new `rethrowReportWorthy` option. With it, a report-worthy failure (contract drift, a 5xx, or server-side a network error or timeout) is still logged and reported, and is then rethrown instead of resolving to the fallback. An expected failure, such as the 401 or 403 of a visitor who is not signed in, still resolves to the fallback. The option defaults to false, so existing callers are unchanged.

It is meant for server-side prefetches that are dehydrated into the page. A rejected query ends in TanStack Query's `error` state, which `dehydrate` leaves out by default, so the browser fetches the query itself instead of hydrating a fallback that stands in for an outage as fresh data.

The query options that a server layout prefetches forward the option: `userInfoQueryOptions`, `loginInfoQueryOptions` and `userScopesQueryOptions` (both sources) through `AuthQueryConfig`, `broadcastsQueryOptions` through `BroadcastsQueryConfig`, and `discoveryQueryOptions` through `DiscoveryQueryConfig`. For discovery, the last good discovery document is still served server-side when there is one; only without one does a report-worthy failure reject rather than resolve to the empty discovery. In the browser, none of these options change.
