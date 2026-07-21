---
'squareone': patch
---

Add a scrim overlay to `FullBleedBackgroundImageSection` so white hero text meets WCAG 1.4.3 contrast over the background photo. The brightest region of the homepage hero image (`Quint-DSC1187.jpg`, ~`rgb(207, 206, 214)`) previously left white text at only ~1.6:1. A 50% black scrim (exposed as the `--scrim-color`/`--scrim-opacity` custom properties, defaulting to `#000000` at `0.5`) composites that worst-case region to ~`rgb(104, 103, 107)`, lifting white text to ~5.6:1. Content now renders in a stacking layer above the scrim so the darkening never falls on the hero text.
