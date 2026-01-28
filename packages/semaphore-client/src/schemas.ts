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

// Infer types from schemas
export type FormattedText = z.infer<typeof FormattedTextSchema>;
export type BroadcastCategory = z.infer<typeof BroadcastCategorySchema>;
export type Broadcast = z.infer<typeof BroadcastSchema>;
export type BroadcastsResponse = z.infer<typeof BroadcastsResponseSchema>;
