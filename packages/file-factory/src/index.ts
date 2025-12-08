/**
 * @lsst-sqre/file-factory
 *
 * CLI tool and programmatic API for scaffolding React components,
 * hooks, contexts, and pages in the Squareone monorepo.
 */

export { defaultConfig } from './config/defaults.js';
export type {
  ArtifactCreationResult,
  ComponentConfig,
  ContextConfig,
  FileFactoryConfig,
  HookConfig,
  HooksConfig,
  LoadConfigOptions,
  LoadConfigResult,
  PageConfig,
  PostCreationMessage,
  Router,
  StyleSystem,
} from './config/index.js';
export {
  findMonorepoRoot,
  findPackageRoot,
  findTemplatesDir,
  loadConfig,
  resolvePackageDir,
} from './config/loader.js';
// Configuration
export { defineConfig, parseConfig, safeParseConfig } from './config/schema.js';
export type {
  ComponentGeneratorOptions,
  ContextGeneratorOptions,
  GeneratorOptions,
  GeneratorResult,
  HookGeneratorOptions,
  PageGeneratorOptions,
} from './generators/index.js';
// Generators
export {
  BaseGenerator,
  ComponentGenerator,
  ContextGenerator,
  createGeneratorOptions,
  generateComponent,
  generateContext,
  generateHook,
  generatePage,
  HookGenerator,
  PageGenerator,
} from './generators/index.js';
// Hooks
export { runHooks } from './hooks/index.js';
export type {
  ProcessTemplatesOptions,
  ProcessTemplatesResult,
  TemplateFile,
} from './utils/index.js';
// Utilities
export {
  // Templates
  discoverTemplateFiles,
  ensureDir,
  extractVariables,
  getActualFilename,
  getAvailableTemplateTypes,
  getBasename,
  // Paths
  getBuiltInTemplatesDir,
  getComponentNames,
  getContextNames,
  getDirname,
  getExtension,
  getPageNames,
  getRelativePath,
  // Interpolation
  interpolate,
  interpolateFilename,
  joinPaths,
  normalizeHookName,
  parseConditionalFilename,
  pathExists,
  pathExistsSync,
  processTemplates,
  readFile,
  renderTemplate,
  renderTemplateFile,
  resolvePath,
  shouldIncludeConditionalFile,
  templateExists,
  toCamelCase,
  toKebabCase,
  // Naming
  toPascalCase,
  toSnakeCase,
  writeFile,
} from './utils/index.js';
