---
'@lsst-sqre/squared': minor
---

Add DateTimePicker component with string-based API

A new comprehensive DateTimePicker component has been added to the squared package, providing:

**Core Features:**
- Date and time selection with ISO 8601 datetime-local format
- Timezone support with conversion between timezones (including 'local' timezone)
- Calendar picker with custom caption (month/year navigation)
- Time input with hours/minutes in 24-hour format
- Timezone selector integrated with the date/time picker
- Full keyboard accessibility and ARIA support
- CSS Modules styling with design tokens
- Comprehensive test coverage (unit and Storybook tests)
- Built on react-day-picker for calendar functionality
- Fixed popover auto-closing issue when clicking inside the picker for better UX in filter contexts

**API Design:**
- **String-based API**: Uses ISO 8601 strings for dates (`defaultValue` prop)
- **Uncontrolled pattern**: Component manages its own state internally
- **Simple onChange signature**: `(isoString: string) => void` - returns ISO 8601 timestamp only
- **Explicit timezone control**: `defaultTimezone` prop for initial timezone (default: 'local')
- **Optional seconds support**: `showSeconds` prop for precise timestamps
- **Force updates**: Use `key` prop to reset component with new values

**Exports:**
- `DateTimePicker` component
- Utility functions for date/time manipulation (`dateUtils.ts`)
- Timezone handling utilities (`timezoneUtils.ts`)

**Usage Example:**
```tsx
<DateTimePicker
  defaultValue="2024-01-15T14:30:00Z"
  defaultTimezone="UTC"
  onChange={(isoString) => console.log(isoString)}
/>
```

The string-based API provides better interoperability with REST APIs and simplifies common usage patterns by eliminating the need for Date object conversion.
