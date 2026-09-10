---
'@lsst-sqre/squared': patch
'squareone': patch
---

Update react-day-picker from 9 to 10 and date-fns from 3 to 4. The `DateTimePicker` calendar now passes react-day-picker's current `classNames` keys. Its previous keys used the pre-v9 names, which react-day-picker 9 had silently ignored, so the selected-day highlight, today marker, outside-month dimming, and disabled-day styling are applied again.
