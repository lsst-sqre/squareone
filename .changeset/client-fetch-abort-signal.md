---
'@lsst-sqre/repertoire-client': minor
'@lsst-sqre/semaphore-client': minor
'@lsst-sqre/gafaelfawr-client': minor
---

Cancel timed-out server-side requests for discovery, broadcasts and the ambient auth queries

The fetch functions behind the queries that the Squareone layout prefetches accept an optional `AbortSignal` and pass it to `fetch`: the new `signal` option of `fetchServiceDiscovery` and `fetchBroadcasts`, and `signal` in the `AuthRequestInit` that `fetchUserInfo`, `fetchLoginInfo` and `fetchTokenInfo` take. `discoveryQueryOptions`, `broadcastsQueryOptions`, `userInfoQueryOptions`, `loginInfoQueryOptions` and `userScopesQueryOptions` (both sources) forward the signal from `reportingQueryFn`, so when a server-side query times out its request is aborted rather than left running. Browser requests are unchanged.

An aborted discovery or broadcasts request never writes the in-process cache, even if its response arrives after the abort, so a timed-out request can't fill the cache for later requests.
