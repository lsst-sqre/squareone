---
'squareone': patch
---

Fix token creation error display for validation errors

Resolved Sentry [SQUAREONE-26](https://rubin-observatory.sentry.io/issues/6981134766/events/1d39710f9f6e4fa1b0aa581ab120226a/): Fixed a crash that occurred when the Gafaelfawr API returned Pydantic validation errors during token creation. Previously, validation error objects were rendered directly in React, causing "Objects are not valid as a React child" errors.
