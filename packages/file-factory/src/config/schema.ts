import { z } from 'zod';

/**
 * Supported style systems for components
 */
export const StyleSystemSchema = z.enum([
  'css-modules',
  'styled-components',
  'tailwind',
  'none',
]);
export type StyleSystem = z.infer<typeof StyleSystemSchema>;

/**
 * Supported Next.js routers
 */
export const RouterSchema = z.enum(['app', 'pages']);
export type Router = z.infer<typeof RouterSchema>;

/**
 * Configuration for updating barrel/index files after generation
 */
export const BarrelUpdateSchema = z.object({
  /** Path to the barrel file relative to package root */
  file: z.string(),
  /** Template string for the export line. Variables: {{ComponentName}}, {{hookName}}, etc. */
  template: z.string(),
  /** Insert position: 'append' (default), 'prepend', or 'alphabetical' */
  position: z.enum(['append', 'prepend', 'alphabetical']).default('append'),
  /** Skip if this export already exists */
  skipIfExists: z.boolean().default(true),
});
export type BarrelUpdate = z.infer<typeof BarrelUpdateSchema>;

/**
 * Component generation configuration
 */
export const ComponentConfigSchema = z.object({
  /** Directory for components relative to package root */
  directory: z.string().default('src/components'),
  /** Style system to use */
  styleSystem: StyleSystemSchema.default('css-modules'),
  /** Generate test file */
  withTest: z.boolean().default(true),
  /** Generate Storybook story */
  withStory: z.boolean().default(false),
  /** Use App Router barrel pattern (export { default } only, no export *) */
  appRouterBarrel: z.boolean().default(true),
  /** Files to update after generation */
  updateBarrels: z.array(BarrelUpdateSchema).default([]),
});
export type ComponentConfig = z.infer<typeof ComponentConfigSchema>;

/**
 * Hook generation configuration
 */
export const HookConfigSchema = z.object({
  /** Directory for hooks relative to package root */
  directory: z.string().default('src/hooks'),
  /** Generate test file */
  withTest: z.boolean().default(true),
  /** Whether hooks get their own directory (default: true) */
  useDirectory: z.boolean().default(true),
  /** Files to update after generation */
  updateBarrels: z.array(BarrelUpdateSchema).default([]),
});
export type HookConfig = z.infer<typeof HookConfigSchema>;

/**
 * Context generation configuration (for global contexts)
 */
export const ContextConfigSchema = z.object({
  /** Directory for global contexts relative to package root */
  directory: z.string().default('src/contexts'),
  /** Generate test file */
  withTest: z.boolean().default(false),
  /** Files to update after generation */
  updateBarrels: z.array(BarrelUpdateSchema).default([]),
});
export type ContextConfig = z.infer<typeof ContextConfigSchema>;

/**
 * Page generation configuration
 */
export const PageConfigSchema = z.object({
  /** Directory for pages relative to package root */
  directory: z.string().default('src/pages'),
  /** Next.js router type */
  router: RouterSchema.default('pages'),
});
export type PageConfig = z.infer<typeof PageConfigSchema>;

/**
 * Artifact creation result passed to hooks
 */
export const ArtifactCreationResultSchema = z.object({
  /** Type of artifact created */
  type: z.enum(['component', 'hook', 'context', 'page']),
  /** Name of the artifact */
  name: z.string(),
  /** List of created file paths (absolute) */
  files: z.array(z.string()),
  /** Package root directory */
  packageRoot: z.string(),
});
export type ArtifactCreationResult = z.infer<
  typeof ArtifactCreationResultSchema
>;

/**
 * Lifecycle hooks configuration
 * Note: Functions cannot be validated by Zod at runtime, so we use z.any() for functions
 */
export const HooksConfigSchema = z
  .object({
    /** Runs after any artifact is created */
    afterCreate: z
      .function()
      .args(ArtifactCreationResultSchema)
      .returns(z.promise(z.void()))
      .optional(),
    /** Runs after a component is created */
    afterComponent: z
      .function()
      .args(ArtifactCreationResultSchema)
      .returns(z.promise(z.void()))
      .optional(),
    /** Runs after a hook is created */
    afterHook: z
      .function()
      .args(ArtifactCreationResultSchema)
      .returns(z.promise(z.void()))
      .optional(),
    /** Runs after a context is created */
    afterContext: z
      .function()
      .args(ArtifactCreationResultSchema)
      .returns(z.promise(z.void()))
      .optional(),
    /** Runs after a page is created */
    afterPage: z
      .function()
      .args(ArtifactCreationResultSchema)
      .returns(z.promise(z.void()))
      .optional(),
  })
  .default({});
export type HooksConfig = z.infer<typeof HooksConfigSchema>;

/**
 * Complete file-factory configuration schema
 */
export const FileFactoryConfigSchema = z.object({
  /** Component generation configuration */
  component: ComponentConfigSchema.default({}),
  /** Hook generation configuration */
  hook: HookConfigSchema.default({}),
  /** Context generation configuration */
  context: ContextConfigSchema.default({}),
  /** Page generation configuration */
  page: PageConfigSchema.default({}),
  /** Lifecycle hooks */
  hooks: HooksConfigSchema,
});
export type FileFactoryConfig = z.infer<typeof FileFactoryConfigSchema>;

/**
 * Helper function to define configuration with type safety
 */
export function defineConfig(
  config: Partial<z.input<typeof FileFactoryConfigSchema>>
): FileFactoryConfig {
  return FileFactoryConfigSchema.parse(config);
}

/**
 * Parse and validate a configuration object
 */
export function parseConfig(config: unknown): FileFactoryConfig {
  return FileFactoryConfigSchema.parse(config);
}

/**
 * Safely parse configuration, returning default config on error
 */
export function safeParseConfig(
  config: unknown
):
  | { success: true; data: FileFactoryConfig }
  | { success: false; error: z.ZodError } {
  const result = FileFactoryConfigSchema.safeParse(config);
  return result;
}
