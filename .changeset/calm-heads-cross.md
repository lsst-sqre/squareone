---
'@lsst-sqre/squared': minor
---

Add a new Button component

This button has flexible styling and utility for a range of applications. It has two main axes of styling via props:

- `appearance` can be `solid|outline|text`
- `tone` is `primary|secondary|tertiary|danger` and controls the semantics of the button
- `role` is a way of quickly setting appearance and tone together for common uses. `role=primary` creates a solid button with primary tone.

The button also supports icons, loading state, and can be implemented both as a button element or as a link.
