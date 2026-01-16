import { generateMock } from '@anatine/zod-mock';
import type { Dataset, ServiceDiscovery } from './schemas';
import {
  DataServiceSchema,
  DatasetSchema,
  DiscoverySchema,
  InternalServiceSchema,
  UiServiceSchema,
} from './schemas';

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
