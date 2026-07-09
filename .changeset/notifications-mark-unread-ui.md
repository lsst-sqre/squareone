---
'squareone': patch
---

Surface "Mark as unread" in the `/notifications` inbox, mirroring the existing mark-read affordances (DM-55450). Read rows now offer a per-row "Mark as unread" menu item (the mirror of "Mark as read" on unread rows), and the selection "Actions" dropdown gains a "Mark as unread" item that marks the read members of the loaded selection unread. Both route through the new `useMarkNotificationsUnread` mutation so the list and the header unread badge update without a manual refresh.
