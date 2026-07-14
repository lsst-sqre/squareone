---
'squareone': patch
---

Add a development mock for the Gafaelfawr per-user tokens API so `/settings/tokens` and `/settings/tokens/new` render fully in `pnpm dev`. New dev-only route handlers under `/api/dev/gafaelfawr/v1/users/:username/tokens*` (rewritten from `/auth/api/v1/users/:username/tokens*`) back a persistent in-memory store that seeds each persona's tokens and supports list, detail, create, and revoke — so the token list, creation flow (success modal included), detail page, and delete flow are all exercisable without a live Gafaelfawr. The mock also mirrors real Gafaelfawr's behavior for error and cross-user paths: it restricts each persona to their own tokens (403 on mismatch) and validates create requests against `CreateTokenRequestSchema`, returning a Gafaelfawr-shaped 422 for a malformed or invalid body. Like the other dev mocks, these handlers use the `.dev.ts` extension and are excluded from production builds.
