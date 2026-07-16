---
'@lsst-sqre/squared': minor
---

Add a responsive collapsed (hamburger) mode to `PrimaryNavigation`. Below a fixed `60rem` breakpoint (chosen to match the SidebarLayout mobile breakpoint) the navigation collapses behind an accessible toggle button that carries `aria-expanded` and `aria-controls`, has a state-dependent accessible name ("Open navigation menu" / "Close navigation menu", overridable via the new `openMenuLabel`/`closeMenuLabel` props), and discloses the item list on activation. Escape closes the menu and returns focus to the toggle, and the menu items remain keyboard operable — mirroring the SidebarLayout mobile-menu pattern. Pass `collapsible={false}` to opt out. The component's focus outlines are also thickened from 1px to a 2px outline with a 2px offset to meet the accessibility baseline.
