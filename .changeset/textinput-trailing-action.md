---
'@lsst-sqre/squared': minor
---

Add trailingAction prop to TextInput component

The TextInput component now supports a `trailingAction` prop for adding interactive elements (like buttons) at the end of the input field. This is distinct from `trailingIcon` which is for non-interactive visual elements.

- `trailingAction` and `trailingIcon` are mutually exclusive
- When `trailingAction` is provided, it takes precedence
- Proper styling and spacing for action elements
- Used by DateTimePicker for calendar toggle button
