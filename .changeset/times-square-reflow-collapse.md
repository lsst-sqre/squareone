---
'squareone': patch
---

Reflow the Times Square layout so no page scrolls horizontally at a 320px viewport (WCAG 1.4.10). The Times Square sidebar-and-content layout was a non-wrapping horizontal flex row, so its fixed-width (18rem) navigation sidebar sat beside the page content and forced horizontal scrolling on narrow viewports. It now stacks the sidebar above the content by default and only reintroduces the side-by-side row layout at the shared `66rem` collapse breakpoint used by SidebarLayout and PrimaryNavigation. Combined with the collapsed `PrimaryNavigation` header nav, every route (`/`, `/notifications`, `/settings/tokens`, `/times-square`, `/api-aspect`, `/support`, `/admin/notifications`) now reflows without horizontal scroll at 320px, and the header nav collapses to the accessible hamburger menu (labeled toggle, Escape closes, focus returns).
