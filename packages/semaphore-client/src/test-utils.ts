import { generateMock } from '@anatine/zod-mock';
import type { Broadcast, BroadcastsResponse } from './schemas';
import {
  BroadcastCategorySchema,
  BroadcastSchema,
  BroadcastsResponseSchema,
  FormattedTextSchema,
} from './schemas';

/**
 * Generate a random broadcast for property testing.
 */
export function generateRandomBroadcast(seed?: number): Broadcast {
  return generateMock(BroadcastSchema, { seed });
}

/**
 * Generate a random broadcasts response for property testing.
 */
export function generateRandomBroadcasts(seed?: number): BroadcastsResponse {
  return generateMock(BroadcastsResponseSchema, { seed });
}

/**
 * Generators for specific schemas.
 */
export const generators = {
  broadcast: (seed?: number) => generateMock(BroadcastSchema, { seed }),
  broadcasts: (seed?: number) =>
    generateMock(BroadcastsResponseSchema, { seed }),
  formattedText: (seed?: number) => generateMock(FormattedTextSchema, { seed }),
  category: (seed?: number) => generateMock(BroadcastCategorySchema, { seed }),
};
