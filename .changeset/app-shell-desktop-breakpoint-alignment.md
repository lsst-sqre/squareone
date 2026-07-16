---
'squareone': patch
---

Fix a layout break in the ~960–1056px viewport range where main content and the footer lost their horizontal gutter (content touched the screen edge) and the sidebar/Times Square layouts engaged their desktop columns before they fit. The app-shell containers cap their width at `60rem`, but because the app's `:root` font-size is `1.1rem` a `60rem` container renders at ~1056px, while CSS media queries measure `rem` against the browser's 16px default — so every paired `@media (min-width: 60rem)` fired ~96px too early (at 960px). The shared desktop breakpoint is now `66rem` (= 60rem × 1.1 ≈ 1056px) across MainContent, Footer, HomepageHero, BroadcastBanner, SidebarLayout, and its Sidebar/MobileMenuToggle, so the desktop layout only engages once the `60rem` container actually fits. Below that width the content keeps its `--size-screen-padding-min` gutter; above it the centered container's auto margins provide the gutter — eliminating the dead zone at every route.
