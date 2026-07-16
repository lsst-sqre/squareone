---
'squareone': patch
---

Keep the header user menu visible when the navigation collapses on mobile. The header nav is now a flex row of two `PrimaryNavigation` roots: the collapsible "Main" nav (hamburger toggle top-left below the `66rem` breakpoint) and a separate non-collapsing "User menu" nav (`collapsible={false}`) holding the `Login`/`UserMenu` at the top-right. Previously `Login` was the last item inside the single collapsible nav, so the user menu disappeared into the hamburger disclosure on narrow viewports. Desktop layout (nav items left, user menu far right) is unchanged.
