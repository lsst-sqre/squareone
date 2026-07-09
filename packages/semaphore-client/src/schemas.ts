import { z } from 'zod';

/**
 * Formatted text with both GitHub-flavored Markdown and HTML representations.
 */
export const FormattedTextSchema = z.object({
  gfm: z.string(),
  html: z.string(),
});

/**
 * Broadcast message categories.
 */
export const BroadcastCategorySchema = z.enum(['outage', 'info', 'notice']);

/**
 * A broadcast message from the Semaphore service.
 */
export const BroadcastSchema = z.object({
  id: z.string(),
  summary: FormattedTextSchema,
  body: FormattedTextSchema.optional(),
  active: z.boolean(),
  enabled: z.boolean(),
  stale: z.boolean(),
  category: BroadcastCategorySchema,
});

/**
 * Response from the broadcasts endpoint (array of broadcasts).
 */
export const BroadcastsResponseSchema = z.array(BroadcastSchema);

/**
 * A user notification from the Semaphore admin API.
 *
 * Returned by the admin detail endpoint
 * (`GET /v1/admin/notifications/{id}`). Unlike the user-facing endpoint,
 * the admin endpoints return `summary` and `body` as **raw Markdown**
 * strings (not pre-rendered gfm/html), so admin UIs render Markdown
 * client-side. `created` and `read` are validated as ISO 8601 date-time
 * strings (offsets allowed, e.g. `2026-06-12T17:10:32+00:00`); `read` is
 * null when the recipient has not read the notification.
 */
export const UserNotificationSchema = z.object({
  id: z.string(),
  created: z.string().datetime({ offset: true }),
  read: z.string().datetime({ offset: true }).nullable(),
  sender: z.string(),
  recipient: z.string(),
  summary: z.string(),
  body: z.string().nullable(),
});

/**
 * A user notification including a URL to the notification resource.
 *
 * Returned by the admin list endpoint (`GET /v1/admin/notifications`).
 */
export const UserNotificationWithUrlSchema = UserNotificationSchema.extend({
  url: z.string(),
});

/**
 * A user-facing notification summary from the Semaphore user API.
 *
 * Returned by the user list endpoint (`GET /v1/notifications/messages`). Unlike the
 * admin shape (raw Markdown strings), the user endpoints return
 * {@link FormattedTextSchema} (`{ gfm, html }`) for `summary` so the client can
 * render the `gfm` field for visual consistency with the admin UI. `created`
 * and `read` are ISO 8601 date-time strings (offsets allowed); `read` is null
 * until the recipient reads the notification. `url` points at the full
 * notification resource. Sender/recipient are intentionally absent: the user
 * API omits the sender and the recipient is always the current user.
 */
export const UserNotificationSummarySchema = z.object({
  id: z.string(),
  created: z.string().datetime({ offset: true }),
  read: z.string().datetime({ offset: true }).nullable(),
  summary: FormattedTextSchema,
  url: z.string(),
});

/**
 * A full user-facing notification from the Semaphore user API.
 *
 * Returned by the user detail endpoint (`GET /v1/notifications/messages/{id}`). Carries
 * the same fields as {@link UserNotificationSummarySchema} except it replaces
 * `url` with the formatted `body` ({@link FormattedTextSchema} or null when the
 * notification has no body). Fetching the detail does **not** auto-mark the
 * notification read.
 */
export const UserNotificationFormattedSchema = z.object({
  id: z.string(),
  created: z.string().datetime({ offset: true }),
  read: z.string().datetime({ offset: true }).nullable(),
  summary: FormattedTextSchema,
  body: FormattedTextSchema.nullable(),
});

/**
 * Payload for creating a user notification via the admin API.
 *
 * Sent to `POST /v1/admin/notifications`. `recipient` and `summary` are
 * required; `summary` may use inline Markdown only, while the optional `body`
 * supports full Markdown.
 */
export const CreateUserNotificationSchema = z.object({
  recipient: z.string(),
  summary: z.string(),
  body: z.string().optional(),
});

// Infer types from schemas
export type FormattedText = z.infer<typeof FormattedTextSchema>;
export type BroadcastCategory = z.infer<typeof BroadcastCategorySchema>;
export type Broadcast = z.infer<typeof BroadcastSchema>;
export type BroadcastsResponse = z.infer<typeof BroadcastsResponseSchema>;
export type UserNotification = z.infer<typeof UserNotificationSchema>;
export type UserNotificationWithUrl = z.infer<
  typeof UserNotificationWithUrlSchema
>;
export type UserNotificationSummary = z.infer<
  typeof UserNotificationSummarySchema
>;
export type UserNotificationFormatted = z.infer<
  typeof UserNotificationFormattedSchema
>;
export type CreateUserNotification = z.infer<
  typeof CreateUserNotificationSchema
>;
