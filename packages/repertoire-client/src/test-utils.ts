import { faker } from '@faker-js/faker';
import type { z } from 'zod';
import { fake, seed, setFaker } from 'zod-schema-faker/v4';
import type { Dataset, ServiceDiscovery } from './schemas';
import {
  DataServiceSchema,
  DatasetSchema,
  DiscoverySchema,
  InternalServiceSchema,
  UiServiceSchema,
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
 * Generate random discovery data for property testing.
 * @param seed - Optional seed for reproducible random data
 */
export function generateRandomDiscovery(seed?: number): ServiceDiscovery {
  return generateMock(DiscoverySchema, { seed });
}

/**
 * Generate random dataset for edge case testing.
 * @param seed - Optional seed for reproducible random data
 */
export function generateRandomDataset(seed?: number): Dataset {
  return generateMock(DatasetSchema, { seed });
}

/**
 * Generators for specific schemas.
 * Useful for creating targeted test data.
 */
export const generators = {
  discovery: (seed?: number) => generateMock(DiscoverySchema, { seed }),
  dataset: (seed?: number) => generateMock(DatasetSchema, { seed }),
  dataService: (seed?: number) => generateMock(DataServiceSchema, { seed }),
  internalService: (seed?: number) =>
    generateMock(InternalServiceSchema, { seed }),
  uiService: (seed?: number) => generateMock(UiServiceSchema, { seed }),
};
