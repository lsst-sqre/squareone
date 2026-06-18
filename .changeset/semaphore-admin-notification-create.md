---
'@lsst-sqre/semaphore-client': minor
---

Add the Semaphore admin notifications **create** layer. A new Zod schema (`CreateUserNotificationSchema`) and inferred `CreateUserNotification` type model the `{ recipient, summary, body? }` create payload. The client function `createAdminNotification(semaphoreUrl, notification, csrfToken)` POSTs to `/v1/admin/notifications` with `credentials: 'include'` and the Gafaelfawr `x-csrf-token` header, returning the created `UserNotificationWithUrl`. A new `mutation-options` module ships `createAdminNotificationMutationOptions` (and the `CreateAdminNotificationVariables` type), whose `onSuccess` invalidates the admin-notifications list query, and the `useCreateAdminNotification(semaphoreUrl)` hook exposes the create mutation.
