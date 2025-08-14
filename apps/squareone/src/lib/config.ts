import getConfig from 'next/config';
import type { PublicRuntimeConfig } from '../types/config';

/**
 * Safely get the public runtime configuration
 * Throws an error if config is not available, which should never happen in a Next.js app
 */
export function getPublicRuntimeConfig(): PublicRuntimeConfig {
  const { publicRuntimeConfig } = getConfig();

  if (!publicRuntimeConfig) {
    throw new Error(
      'Public runtime config is not available. This should not happen in a Next.js application.'
    );
  }

  return publicRuntimeConfig as PublicRuntimeConfig;
}

/**
 * Safely get a specific config value with a fallback
 */
export function getConfigValue<K extends keyof PublicRuntimeConfig>(
  key: K,
  fallback?: PublicRuntimeConfig[K]
): PublicRuntimeConfig[K] {
  try {
    const config = getPublicRuntimeConfig();
    return config[key] ?? fallback;
  } catch {
    if (fallback !== undefined) {
      return fallback;
    }
    throw new Error(
      `Config value '${String(key)}' is not available and no fallback provided`
    );
  }
}
