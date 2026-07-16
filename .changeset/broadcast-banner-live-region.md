---
'squareone': patch
---

Announce broadcast banners to screen readers via persistent ARIA live regions. Because broadcasts arrive from a client-side fetch, `BroadcastBannerStack` now always renders two live-region containers — a polite `role="status"` region for info and notice banners and an assertive `role="alert"` region for outage banners — even while the fetch is pending, errored, or empty. The containers exist in the DOM before the fetch resolves, so banners inserted into them are reliably announced (a polite `role="status"` region only announces content changes when the region already exists). Empty containers add no visible space. Individual `BroadcastBanner` components no longer carry their own live-region role, avoiding nested/duplicate live regions, and each banner keeps its named complementary `<aside>` landmark.
