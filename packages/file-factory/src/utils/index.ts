// Naming utilities

// Interpolation utilities
export {
  extractVariables,
  getActualFilename,
  interpolate,
  interpolateFilename,
  parseConditionalFilename,
  shouldIncludeConditionalFile,
} from './interpolate.js';
export {
  getComponentNames,
  getContextNames,
  getPageNames,
  normalizeHookName,
  toCamelCase,
  toKebabCase,
  toPascalCase,
  toSnakeCase,
} from './naming.js';
// Path utilities
export {
  ensureDir,
  getBasename,
  getBuiltInTemplatesDir,
  getDirname,
  getExtension,
  getRelativePath,
  joinPaths,
  pathExists,
  pathExistsSync,
  readFile,
  resolvePath,
  writeFile,
} from './paths.js';
export type {
  ProcessTemplatesOptions,
  ProcessTemplatesResult,
  TemplateFile,
} from './templates.js';
// Template utilities
export {
  discoverTemplateFiles,
  getAvailableTemplateTypes,
  processTemplates,
  renderTemplate,
  renderTemplateFile,
  templateExists,
} from './templates.js';
