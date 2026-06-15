---
"squareone": patch
---

Harden the App Router shell against browser-extension hydration noise and guard it against future SSR/CSR non-determinism.

`<body>` now carries `suppressHydrationWarning` so attributes injected by browser extensions (Grammarly, password managers, Dark Reader, etc.) onto the `<body>` element no longer trip React's hydration warning — complementing the existing `<html suppressHydrationWarning>`. The suppression covers one level only (the `<body>` element's own attributes), not extension-injected child nodes. A deterministic-render audit of the shared shell chain (`layout` → `Header` / `PreHeader` / `HeaderNav` / `Login` / `UserMenu` → `BroadcastBannerStack` → `FooterRsc` → `PrimaryNavigation`) found it free of genuine SSR/CSR non-determinism — the auth path is guarded by a `hasMounted` two-pass, there is no theme-conditional rendering, and no time/random/locale-dependent output — so no production fixes were required. New shell render-determinism tests render each shell component twice with identical props and assert byte-identical server markup, guarding against future non-deterministic regressions.
