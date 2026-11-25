---
'@lsst-sqre/gafaelfawr-client': minor
---

Keep the TAP `bytes_billed` and `disk` quotas when parsing user info

`QuotaSchema` used to strip two fields of Gafaelfawr's user-info quota, so apps could not show them. It now keeps both:

- `tap.<service>.bytes_billed`: the most data, in bytes, that the TAP service may scan to produce the user's query results in a 24-hour window. It is optional and nullable, so a Gafaelfawr that does not send it, or sends `null`, still parses. `concurrent` stays required. The TAP quota object is exported as `TapQuotaSchema`, with its `TapQuota` type.
- `disk`: a mapping of filesystem mount points to disk quota allocations in bytes, such as `{ "/home": 32212254720 }`. A response without `disk` parses to `disk: {}`, as `api` and `tap` already default.

`disk` is a required key of the parsed `Quota` type, so `Quota` literals in TypeScript code need a `disk` entry (`{}` where none applies).

`mockUserInfo` now has a `/home` disk quota and two TAP quotas, `qserv` with a `bytes_billed` quota and `ssotap` without one.
