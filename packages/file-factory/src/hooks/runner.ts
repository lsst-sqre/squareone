import type { ArtifactCreationResult, HooksConfig } from '../config/schema.js';

/**
 * Run lifecycle hooks after artifact creation
 *
 * Executes hooks in order:
 * 1. Type-specific hook (afterComponent, afterHook, afterContext, afterPage)
 * 2. Generic afterCreate hook
 */
export async function runHooks(
  hooksConfig: HooksConfig,
  result: ArtifactCreationResult
): Promise<void> {
  const { type } = result;

  // Run type-specific hook first
  const typeHookName =
    `after${type.charAt(0).toUpperCase()}${type.slice(1)}` as keyof HooksConfig;
  const typeHook = hooksConfig[typeHookName] as
    | ((result: ArtifactCreationResult) => Promise<void>)
    | undefined;

  if (typeHook) {
    try {
      await typeHook(result);
    } catch (error) {
      console.warn(
        `Warning: ${typeHookName} hook failed:`,
        error instanceof Error ? error.message : error
      );
    }
  }

  // Run generic afterCreate hook
  if (hooksConfig.afterCreate) {
    try {
      await hooksConfig.afterCreate(result);
    } catch (error) {
      console.warn(
        'Warning: afterCreate hook failed:',
        error instanceof Error ? error.message : error
      );
    }
  }
}
