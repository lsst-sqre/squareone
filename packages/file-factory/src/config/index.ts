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
  ComponentConfig,
  ContextConfig,
  FileFactoryConfig,
  HookConfig,
  HooksConfig,
  PageConfig,
  PostCreationMessage,
  Router,
  StyleSystem,
} from './schema.js';
export {
  ArtifactCreationResultSchema,
  ComponentConfigSchema,
  ContextConfigSchema,
  defineConfig,
  FileFactoryConfigSchema,
  HookConfigSchema,
  HooksConfigSchema,
  PageConfigSchema,
  PostCreationMessageSchema,
  parseConfig,
  RouterSchema,
  StyleSystemSchema,
  safeParseConfig,
} from './schema.js';
