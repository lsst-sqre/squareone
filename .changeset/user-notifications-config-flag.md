---
'squareone': minor
---

Add two feature-flag config keys for the upcoming user notifications UI: `enableUserNotifications` (boolean, default `false`) and `userNotificationsPollIntervalSeconds` (number, default `300`). Both flow through the existing config pipeline — declared in `squareone.config.schema.json` with titles/descriptions/defaults, added to the `AppConfig` type, and defaulted in `squareone.config.yaml` — so they resolve via `getStaticConfig()` / `useStaticConfig()`. They ship `false`/`300` everywhere and no UI consumes them yet; the flag keeps the in-progress notifications feature hidden until it is released.
