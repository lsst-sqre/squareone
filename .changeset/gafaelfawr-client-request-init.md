---
'@lsst-sqre/gafaelfawr-client': minor
---

`fetchUserInfo` and `fetchLoginInfo` accept an optional second argument, an `AuthRequestInit` with `headers` and `cache`, that is merged over their default `credentials: 'include'`. `AuthQueryConfig` has a new `headers` option that `userInfoQueryOptions` and `loginInfoQueryOptions` forward to the fetch, so a server component can prefetch a user's login info or user info by passing the incoming request's `cookie` header (`credentials: 'include'` sends no cookie outside a browser). When `headers` is set, or `isServer` is `true`, the fetch uses `cache: 'no-store'` so that a cookie-bearing response is never cached by Next's fetch layer. Browser calls that set neither option are unchanged.
