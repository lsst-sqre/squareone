---
'@lsst-sqre/squared': minor
---

Refactor DateTimePicker to use Date objects and local timezone

**Breaking changes in API (within 0.x versions):**
- DateTimePicker now accepts and returns `Date` objects instead of timestamp strings
- Removed timezone prop - component now operates exclusively in local timezone
- Simplified internal state management focused on Date object manipulation

**Improvements:**
- More intuitive API using native JavaScript Date objects
- Better integration with forms and standard date handling
- Clearer semantics - component handles local time, consumers handle timezone conversion if needed
- Reduced complexity by removing internal timezone conversion logic
- Updated date utility functions to work with Date objects
- Enhanced test coverage for Date-based operations

**Migration notes:**
- Convert existing timestamp string usage to Date objects: `new Date(timestamp)` for input, `date.toISOString()` for output
- Handle timezone conversion at the application level if needed (e.g., in TokenHistoryFilters)
- The component's datetime-local input now correctly represents local time without timezone confusion
