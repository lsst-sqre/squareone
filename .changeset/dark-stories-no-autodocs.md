---
'@lsst-sqre/squared': patch
'squareone': patch
---

Keep the dark-theme Storybook stories out of the autodocs pages. Each component's `Dark` story pins the theme global to dark, and in docs mode every story on the page shares one `<html data-theme>`, so the last story to mount flipped the whole docs page to dark even with the toolbar set to light. Those stories are now tagged `!autodocs`; they remain in the sidebar and in Chromatic.
