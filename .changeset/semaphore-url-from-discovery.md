---
'squareone': patch
---

Resolve the Semaphore service URL from Repertoire service discovery instead of the static `semaphoreUrl` config field. The `useSemaphoreUrl` hook now derives the URL via `useRepertoireUrl` → `useServiceDiscovery(...).getSemaphoreUrl()` (mirroring the broadcast banner and the RSC layout), returning `undefined` while discovery is pending or when Repertoire/Semaphore is undiscovered so dependent queries stay gracefully disabled. `BroadcastBannerStack` is simplified to consume this consolidated hook rather than wiring up discovery inline.

The `semaphoreUrl` config field is **deprecated** (marked `@deprecated` in `AppConfig` and `"deprecated": true` in the config schema) but intentionally retained: the schema is `additionalProperties: false`, so removing it would make existing Phalanx configurations that still set `semaphoreUrl` fail validation on deploy. No app code reads it any longer; it is slated for removal in a later change once Phalanx stops delivering it. The redundant dev `semaphoreUrl` entry is dropped from `squareone.config.yaml` since the dev Repertoire discovery mock already advertises the local Semaphore mock origin.
