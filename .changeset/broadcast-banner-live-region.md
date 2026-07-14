---
'squareone': patch
---

Make broadcast banners ARIA live regions so screen readers announce them when they appear after the client-side fetch. Each `BroadcastBanner` now wraps its content in a live-region container: info and notice banners use a polite `role="status"`, while outage banners use an assertive `role="alert"`. The named complementary `<aside>` landmark inside each banner is preserved.
