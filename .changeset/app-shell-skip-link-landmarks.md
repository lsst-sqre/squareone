---
'squareone': patch
---

Add a skip link, a single root `<main>` landmark, and named navigation/complementary landmarks to the app shell. The root layout now renders a "Skip to main content" link as the first focusable element on every page, targeting one focusable `<main id="main-content">` that wraps the page content. Page and layout wrappers (MainContent, SidebarLayout, TimesSquareApp, the error boundary) no longer declare their own `<main>`, so there is exactly one main landmark per page — including sidebar routes, where the previous ineffective (11th tab stop) skip link has been removed. The header nav ("Main"), footer nav ("Footer"), sidebar nav (its title), Times Square notebook nav ("Notebooks"), and broadcast-banner `<aside>` landmarks are now labeled so axe's `region` and `landmark-unique` rules pass on `/`, `/settings/tokens`, and `/times-square`.
