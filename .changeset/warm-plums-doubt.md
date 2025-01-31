---
'@lsst-sqre/squared': minor
---

Add a new PrimaryNavigation component. This component uses the Radix [NavigationMenu](https://www.radix-ui.com/primitives/docs/components/navigation-menu) primitive and is intended to be a comprehensive solution for the primary navigation in the header of Squareone. The earlier `GafaelfawrUserMenu` component in Squared also uses `NavigationMenu`, but as a single item. With `PrimaryNavigation`, the functionality of `GafaelfawrUserMenu` can be composed into an instance of `PrimaryNavigation`. Like `GafaelfawrMenu`, `PrimaryNavigation` is set up so that menus only appear after clicking on a trigger, rather than on hover. As well, `PrimaryNavigation` ensures the menu is proximate to the trigger (an improvement on the default `NavigationMenu` functionality that centers the menu below the whole navigation element.
