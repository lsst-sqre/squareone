import * as fs from 'node:fs';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';
import { defaultConfig } from './defaults.js';
import { type FileFactoryConfig, FileFactoryConfigSchema } from './schema.js';

/**
 * Configuration file names to search for
 */
const CONFIG_FILE_NAMES = [
  'config.mts',
  'config.ts',
  'config.js',
  'config.mjs',
] as const;

/**
 * Find the monorepo root by looking for pnpm-workspace.yaml
 */
export function findMonorepoRoot(startDir: string): string | null {
  let currentDir = path.resolve(startDir);
  const root = path.parse(currentDir).root;

  while (currentDir !== root) {
    const workspaceFile = path.join(currentDir, 'pnpm-workspace.yaml');
    if (fs.existsSync(workspaceFile)) {
      return currentDir;
    }
    currentDir = path.dirname(currentDir);
  }

  return null;
}

/**
 * Find the package root by looking for package.json
 */
export function findPackageRoot(startDir: string): string | null {
  let currentDir = path.resolve(startDir);
  const root = path.parse(currentDir).root;

  while (currentDir !== root) {
    const packageFile = path.join(currentDir, 'package.json');
    if (fs.existsSync(packageFile)) {
      return currentDir;
    }
    currentDir = path.dirname(currentDir);
  }

  return null;
}

/**
 * Find a configuration file in a directory
 */
function findConfigFile(dir: string): string | null {
  const fileFactoryDir = path.join(dir, '.file-factory');

  if (!fs.existsSync(fileFactoryDir)) {
    return null;
  }

  for (const fileName of CONFIG_FILE_NAMES) {
    const filePath = path.join(fileFactoryDir, fileName);
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }

  return null;
}

/**
 * Load a configuration file dynamically
 */
async function loadConfigFile(
  filePath: string
): Promise<Partial<FileFactoryConfig>> {
  try {
    // Use dynamic import for ES modules
    const fileUrl = pathToFileURL(filePath).href;
    const module = await import(fileUrl);

    // Support both default export and named defineConfig export
    const config = module.default || module;

    // Validate with Zod (partial validation)
    const result = FileFactoryConfigSchema.partial().safeParse(config);

    if (!result.success) {
      console.warn(
        `Warning: Invalid configuration in ${filePath}:`,
        result.error.message
      );
      return {};
    }

    return result.data;
  } catch (error) {
    console.warn(
      `Warning: Failed to load configuration from ${filePath}:`,
      error
    );
    return {};
  }
}

/**
 * Deep merge two configuration objects
 */
function mergeConfigs(
  base: FileFactoryConfig,
  override: Partial<FileFactoryConfig>
): FileFactoryConfig {
  return {
    component: { ...base.component, ...override.component },
    hook: { ...base.hook, ...override.hook },
    context: { ...base.context, ...override.context },
    page: { ...base.page, ...override.page },
    hooks: { ...base.hooks, ...override.hooks },
  };
}

export interface LoadConfigOptions {
  /** Package root directory (defaults to current working directory) */
  packageRoot?: string;
  /** Monorepo root directory (auto-detected if not provided) */
  monorepoRoot?: string;
}

export interface LoadConfigResult {
  /** The merged configuration */
  config: FileFactoryConfig;
  /** Path to the package configuration file (if found) */
  packageConfigPath: string | null;
  /** Path to the monorepo configuration file (if found) */
  monorepoConfigPath: string | null;
  /** The package root directory */
  packageRoot: string;
  /** The monorepo root directory (if found) */
  monorepoRoot: string | null;
}

/**
 * Load and merge configuration from package and monorepo
 *
 * Resolution order (later overrides earlier):
 * 1. Default configuration
 * 2. Monorepo root .file-factory/config.ts
 * 3. Package .file-factory/config.ts
 */
export async function loadConfig(
  options: LoadConfigOptions = {}
): Promise<LoadConfigResult> {
  const packageRoot = options.packageRoot
    ? path.resolve(options.packageRoot)
    : findPackageRoot(process.cwd()) || process.cwd();

  const monorepoRoot = options.monorepoRoot
    ? path.resolve(options.monorepoRoot)
    : findMonorepoRoot(packageRoot);

  let config = { ...defaultConfig };
  let monorepoConfigPath: string | null = null;
  let packageConfigPath: string | null = null;

  // Load monorepo configuration first
  if (monorepoRoot) {
    monorepoConfigPath = findConfigFile(monorepoRoot);
    if (monorepoConfigPath) {
      const monorepoConfig = await loadConfigFile(monorepoConfigPath);
      config = mergeConfigs(config, monorepoConfig);
    }
  }

  // Load package configuration (overrides monorepo config)
  packageConfigPath = findConfigFile(packageRoot);
  if (packageConfigPath) {
    const packageConfig = await loadConfigFile(packageConfigPath);
    config = mergeConfigs(config, packageConfig);
  }

  return {
    config,
    packageConfigPath,
    monorepoConfigPath,
    packageRoot,
    monorepoRoot,
  };
}

/**
 * Find templates directory, checking package first, then monorepo, then built-in
 */
export function findTemplatesDir(
  templateType: string,
  packageRoot: string,
  monorepoRoot: string | null,
  builtInTemplatesDir: string
): string {
  // Check package templates first
  const packageTemplates = path.join(
    packageRoot,
    '.file-factory',
    'templates',
    templateType
  );
  if (fs.existsSync(packageTemplates)) {
    return packageTemplates;
  }

  // Check monorepo templates
  if (monorepoRoot) {
    const monorepoTemplates = path.join(
      monorepoRoot,
      '.file-factory',
      'templates',
      templateType
    );
    if (fs.existsSync(monorepoTemplates)) {
      return monorepoTemplates;
    }
  }

  // Fall back to built-in templates
  const builtInTemplates = path.join(builtInTemplatesDir, templateType);
  if (fs.existsSync(builtInTemplates)) {
    return builtInTemplates;
  }

  throw new Error(`No templates found for type: ${templateType}`);
}

/**
 * Build a map from package name to directory path.
 * Processes packages first, then apps - apps override for short name conflicts.
 */
function buildPackageMap(monorepoRoot: string): Map<string, string> {
  const map = new Map<string, string>();
  // Process packages first, then apps - apps override for short name conflicts
  const dirs = ['packages', 'apps'];

  for (const dir of dirs) {
    const fullDir = path.join(monorepoRoot, dir);
    if (!fs.existsSync(fullDir)) continue;

    for (const entry of fs.readdirSync(fullDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;

      const pkgJsonPath = path.join(fullDir, entry.name, 'package.json');
      if (!fs.existsSync(pkgJsonPath)) continue;

      try {
        const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
        const name = pkgJson.name;
        if (name) {
          const pkgDir = path.join(fullDir, entry.name);
          // Map full name (always set, even if duplicate - apps override packages)
          map.set(name, pkgDir);
          // Also map short name (without scope) - apps override packages
          if (name.startsWith('@') && name.includes('/')) {
            const shortName = name.split('/')[1];
            map.set(shortName, pkgDir);
          }
        }
      } catch {
        // Skip packages with invalid package.json
      }
    }
  }

  return map;
}

/**
 * Resolve a package specifier to a directory path
 *
 * Supports:
 * - Package names (e.g., "@lsst-sqre/squared", "squared", "squareone")
 * - Directory paths (e.g., "apps/squareone", "packages/squared")
 * - Relative paths (e.g., "./packages/squared")
 * - Absolute paths
 */
export function resolvePackageDir(
  packageSpecifier: string,
  monorepoRoot: string
): string | null {
  // Handle absolute paths
  if (path.isAbsolute(packageSpecifier)) {
    return fs.existsSync(packageSpecifier) ? packageSpecifier : null;
  }

  // Handle relative paths (starting with ./ or ../)
  if (packageSpecifier.startsWith('./') || packageSpecifier.startsWith('../')) {
    const resolved = path.resolve(process.cwd(), packageSpecifier);
    return fs.existsSync(resolved) ? resolved : null;
  }

  // Handle paths like "apps/squareone" or "packages/squared"
  if (
    packageSpecifier.startsWith('apps/') ||
    packageSpecifier.startsWith('packages/')
  ) {
    const resolved = path.join(monorepoRoot, packageSpecifier);
    return fs.existsSync(resolved) ? resolved : null;
  }

  // Build package map and look up by name
  // This handles scoped names (@lsst-sqre/squared), short names (squared), and app names (squareone)
  const packageMap = buildPackageMap(monorepoRoot);
  const resolvedPath = packageMap.get(packageSpecifier);
  if (resolvedPath) {
    return resolvedPath;
  }

  return null;
}
