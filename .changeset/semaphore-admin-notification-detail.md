---
'squareone': minor
---

Add the `/admin/notifications/[id]` detail page for admin user notifications. Reached by opening a single notification (under the inherited `exec:admin` gate), it renders the notification's summary and body as rendered Markdown — not raw — alongside its full metadata (id, recipient, sender, created time, and read status, shown as an Unread/Read badge plus the read timestamp). The page is addressable by URL via the server `page.tsx` (which derives its metadata from the route id), and an unknown id resolves to a graceful not-found state with a link back to the listing rather than a blank page. The presentational `NotificationDetailView` is driven entirely by props and ships with a Storybook story (loaded / read / no-body / loading / not-found / error) that runs as an interaction test.
