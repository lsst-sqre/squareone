---
'squareone': patch
---

Remove deprecated amp config inherited from defaultConfig

The Next.js config was spreading `defaultConfig` which included the deprecated `amp` configuration option. This caused deprecation warnings during builds. The fix removes the unnecessary `defaultConfig` spread since Next.js applies sensible defaults automatically, and we only need to specify our custom configuration options.
