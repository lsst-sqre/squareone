'use client';

import { useStaticConfig } from './useStaticConfig';

/**
 * Hook to get the Repertoire service discovery URL from configuration.
 *
 * Works in both App Router and Pages Router contexts by leveraging
 * the unified useStaticConfig hook.
 *
 * @returns The Repertoire URL if configured, undefined otherwise.
 */
export function useRepertoireUrl(): string | undefined {
  const config = useStaticConfig();
  return config.repertoireUrl;
}
