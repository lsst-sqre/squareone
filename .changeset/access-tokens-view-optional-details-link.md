---
"squareone": patch
---

Make the token-key details link optional in `AccessTokenItem` /
`AccessTokensView`.

`AccessTokenItem` gains a `showDetailsLink?: boolean` prop (default `true`).
When `true` it keeps rendering the existing `/settings/tokens/<key>` details
link on the token key; when `false` it renders the key as plain text (same
styling, no anchor) for listings where that route does not resolve — such as
service tokens. `AccessTokensView` gains the matching `showDetailsLink?:
boolean` prop (default `true`) and forwards it to each item, so the
`/settings/tokens` user-token listing is unchanged.
