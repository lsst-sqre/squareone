---
"squareone": minor
---

Add Sentry capture and a user-facing error state to the token pages (DM-55604). `TokenDetailsView` no longer silently closes the delete confirmation modal when a delete fails: it surfaces a user-facing error message (so the still-listed token does not look silently deleted) and reports the exception to Sentry via `makeReportError`, matching the sibling `AccessTokenItem`/`SessionTokenItem` `onDeleteError` capture pattern. `NewTokenPageClient` now reports the token-creation submit exception it previously only `console.error`ed; its existing user-facing `creationError` UX is unchanged.
