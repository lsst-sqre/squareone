---
"squareone": minor
---

Add runtime-configurable header logo

The header logo can now be customized at runtime through the AppConfig system, enabling per-deployment branding without code changes. The custom header can be an external image URL (`headerLogoUrl` configuration), or embedded base64-encoded image data (`headerLogoData` + `headerLogoMimeType` configurations). When using custom logos, `headerLogoWidth` and `headerLogoHeight` must be provided to ensure correct display dimensions.
