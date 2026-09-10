import { faker } from '@faker-js/faker';
import type { z } from 'zod';
import { fake, seed, setFaker } from 'zod-schema-faker/v4';
import type { Broadcast, BroadcastsResponse } from './schemas';
import {
  BroadcastCategorySchema,
  BroadcastSchema,
  BroadcastsResponseSchema,
  FormattedTextSchema,
} from './schemas';

setFaker(faker);

/**
 * Generate fake data for a schema, optionally seeded for reproducibility.
 */
function generateMock<T extends z.ZodType>(
  schema: T,
  options: { seed?: number } = {}
): z.infer<T> {
  seed(options.seed);
  return fake(schema);
}

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
