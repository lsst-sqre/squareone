---
'@lsst-sqre/squared': minor
---

Add DateTimePicker component

A new comprehensive DateTimePicker component has been added to the squared package, providing:

- Date and time selection with ISO 8601 datetime-local format
- Timezone support with conversion between timezones
- Calendar picker with custom caption (month/year navigation)
- Time input with hours/minutes in 24-hour format
- Timezone selector integrated with the date/time picker
- Full keyboard accessibility and ARIA support
- CSS Modules styling with design tokens
- Comprehensive test coverage (unit and Storybook tests)
- Built on react-day-picker for calendar functionality

The component exports `DateTimePicker` as the main component, plus utility functions for date/time manipulation (`dateUtils.ts`) and timezone handling (`timezoneUtils.ts`).
