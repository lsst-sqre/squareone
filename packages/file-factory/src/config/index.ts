// Schema and types

// Defaults
export { defaultConfig } from './defaults.js';
export type { LoadConfigOptions, LoadConfigResult } from './loader.js';
// Loader
export {
  findMonorepoRoot,
  findPackageRoot,
  findTemplatesDir,
  loadConfig,
  resolvePackageDir,
} from './loader.js';
export type {
  ArtifactCreationResult,
  BarrelUpdate,
  ComponentConfig,
  ContextConfig,
  FileFactoryConfig,
  HookConfig,
  HooksConfig,
  PageConfig,
  Router,
  StyleSystem,
} from './schema.js';
export {
  ArtifactCreationResultSchema,
  BarrelUpdateSchema,
  ComponentConfigSchema,
  ContextConfigSchema,
  defineConfig,
  FileFactoryConfigSchema,
  HookConfigSchema,
  HooksConfigSchema,
  PageConfigSchema,
  parseConfig,
  RouterSchema,
  StyleSystemSchema,
  safeParseConfig,
} from './schema.js';
