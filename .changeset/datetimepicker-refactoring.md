---
'@lsst-sqre/squared': minor
---

Refactor DateTimePicker to use string-based API

**Breaking changes in API (within 0.x versions):**
- Renamed `value` → `defaultValue` (accepts ISO8601 strings)
- Renamed `timezone` → `defaultTimezone` (clarifies initial timezone)
- Simplified `onChange` signature to `(string)` - now returns only ISO8601 string
- Component now uses uncontrolled pattern - use `key` prop to force resets with new values

**Improvements:**
- Clearer API with explicit timezone control via `defaultTimezone` prop
- Better interoperability with APIs - no Date conversion needed
- Simpler component usage in common cases
- String-based API makes timezone semantics more explicit
- Preserved all functionality (timezone selection, seconds support, validation)
- Enhanced test coverage for string-based operations and uncontrolled pattern

**Migration notes:**
- Change `value={date}` to `defaultValue={date.toISOString()}`
- Change `timezone="UTC"` to `defaultTimezone="UTC"`
- Update `onChange` handlers from `(date, iso) => ...` to `(iso) => ...`
- Convert ISO8601 strings to Date objects when needed: `new Date(iso)`
- Use `key` prop to force component resets: `<DateTimePicker key={value} defaultValue={value} />`
