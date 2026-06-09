---
"squareone": patch
---

Drop the redundant token-key line for service tokens in the
`/admin/service-tokens/search` listing.

Service tokens have no `token_name` (so the bold heading already shows the
token key) and no `/settings/tokens/<key>` details page, so the second,
link-styled key line was just a non-clickable duplicate. `AccessTokenItem` now
omits that line entirely when `showDetailsLink` is `false` instead of rendering
the key as plain text. The user-token settings listing (`showDetailsLink`
defaults to `true`) still shows the linked key and is unaffected.
