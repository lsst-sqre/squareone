---
'squareone': minor
---

Add explicit mark-read actions to the `/notifications` inbox (behind the `enableUserNotifications` flag). `UserNotificationsTableView` gains controlled row selection (a leading checkbox column with select-all, keyed by notification id), a bulk-actions `DropdownMenu` whose "Mark read" action is enabled only when at least one row is selected and marks the selection read (clearing it afterwards), and a "Mark all as read" button. The inbox container enumerates the unread ids on demand (the `?unread=true` list) for "Mark all as read" and routes both actions through `useMarkNotificationsRead`, whose shared cache invalidation updates the list, the unread count, and each affected detail without a manual refresh. The bulk dropdown is built to be extensible for future bulk actions.
