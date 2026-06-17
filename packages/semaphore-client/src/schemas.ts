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

// Infer types from schemas
export type FormattedText = z.infer<typeof FormattedTextSchema>;
export type BroadcastCategory = z.infer<typeof BroadcastCategorySchema>;
export type Broadcast = z.infer<typeof BroadcastSchema>;
export type BroadcastsResponse = z.infer<typeof BroadcastsResponseSchema>;
export type UserNotification = z.infer<typeof UserNotificationSchema>;
export type UserNotificationWithUrl = z.infer<
  typeof UserNotificationWithUrlSchema
>;
