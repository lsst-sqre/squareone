---
"@lsst-sqre/squared": patch
---

Button's loading spinner is now decorative (`aria-hidden`) instead of a `role="status"` live region. A button in its `loading` state usually sits beside the region that announces the outcome of the same action, and two polite regions gave one action two competing announcements — while any `getByRole('status')` query covering the pending state resolved to two elements and threw. The pending state is still reported to assistive tech by `aria-busy` on the control, which the button already set, and dropping the spinner's `aria-label="Loading"` also keeps the button's accessible name stable across the loading transition. Consumers that need the pending state spoken should render their own live region, where they can say what is pending.
