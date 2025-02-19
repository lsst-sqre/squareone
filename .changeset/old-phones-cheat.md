---
'squareone': minor
---

Reimplement `HeaderNav` using the `PrimaryNavigation` component from Squared. Although the menu looks the same visually, it is now entirely powered by the Radix `NavigationMenu` primitive so that any menu item can be a trigger for a menu rather than a link to another page. The Login / user menu is reimplemented as a menu item rather than with the special GafaelfawrUserMenu component.
