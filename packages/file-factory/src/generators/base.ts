import * as path from 'node:path';
import chalk from 'chalk';
import { findTemplatesDir, type LoadConfigResult } from '../config/loader.js';
import type {
  ArtifactCreationResult,
  FileFactoryConfig,
  PostCreationMessage,
} from '../config/schema.js';
import { runHooks } from '../hooks/runner.js';
import { interpolate } from '../utils/interpolate.js';
import { getBuiltInTemplatesDir, pathExists } from '../utils/paths.js';
import { processTemplates } from '../utils/templates.js';

/**
 * Base options for all generators
 */
export interface GeneratorOptions {
  /** Name of the artifact to create */
  name: string;
  /** Package root directory */
  packageRoot: string;
  /** Monorepo root directory (if applicable) */
  monorepoRoot: string | null;
  /** Configuration */
  config: FileFactoryConfig;
  /** Dry run mode - don't write files */
  dryRun?: boolean;
  /** Verbose output */
  verbose?: boolean;
}

/**
 * Result of a generator run
 */
export interface GeneratorResult {
  /** Whether the generation was successful */
  success: boolean;
  /** Created files (absolute paths) */
  files: string[];
  /** Created directories (absolute paths) */
  directories: string[];
  /** Error message if generation failed */
  error?: string;
}

/**
 * Base generator class
 *
 * Provides common functionality for all artifact generators:
 * - Template discovery and resolution
 * - File generation from templates
 * - Barrel file updates
 * - Lifecycle hook execution
 */
export abstract class BaseGenerator {
  protected options: GeneratorOptions;
  protected builtInTemplatesDir: string;

  constructor(options: GeneratorOptions) {
    this.options = options;
    this.builtInTemplatesDir = getBuiltInTemplatesDir();
  }

  /**
   * Get the artifact type identifier
   */
  abstract get artifactType(): 'component' | 'hook' | 'context' | 'page';

  /**
   * Get the template type to use
   */
  abstract get templateType(): string;

  /**
   * Get the target directory for generated files
   */
  abstract get targetDirectory(): string;

  /**
   * Get variables for filename interpolation
   */
  abstract getFilenameVariables(): Record<string, string>;

  /**
   * Get data for template rendering
   */
  abstract getTemplateData(): Record<string, unknown>;

  /**
   * Get flags for conditional file inclusion
   */
  abstract getConditionalFlags(): Record<string, boolean>;

  /**
   * Get post-creation message configuration (if any)
   */
  abstract getPostCreationMessage(): PostCreationMessage | undefined;

  /**
   * Get variables for post-creation message interpolation
   */
  getMessageVariables(): Record<string, string> {
    return this.getFilenameVariables();
  }

  /**
   * Resolve the templates directory
   */
  protected resolveTemplatesDir(): string {
    return findTemplatesDir(
      this.templateType,
      this.options.packageRoot,
      this.options.monorepoRoot,
      this.builtInTemplatesDir
    );
  }

  /**
   * Log a message if verbose mode is enabled
   */
  protected log(message: string): void {
    if (this.options.verbose) {
      console.log(message);
    }
  }

  /**
   * Log an error message
   */
  protected logError(message: string): void {
    console.error(chalk.red(message));
  }

  /**
   * Log a success message
   */
  protected logSuccess(message: string): void {
    console.log(chalk.green(message));
  }

  /**
   * Log a warning message
   */
  protected logWarning(message: string): void {
    console.log(chalk.yellow(message));
  }

  /**
   * Validate the generator options
   *
   * Override in subclasses to add type-specific validation
   */
  protected async validate(): Promise<string | null> {
    // Check if target already exists
    const targetPath = path.join(
      this.options.packageRoot,
      this.targetDirectory
    );

    const filenameVars = this.getFilenameVariables();
    const primaryName = Object.values(filenameVars)[0];

    if (!primaryName) {
      return 'No name provided';
    }

    // For directory-based artifacts, check if directory exists
    const artifactPath = path.join(targetPath, primaryName);
    if (await pathExists(artifactPath)) {
      return `${this.artifactType} already exists at: ${artifactPath}`;
    }

    return null;
  }

  /**
   * Run the generator
   */
  async run(): Promise<GeneratorResult> {
    const result: GeneratorResult = {
      success: false,
      files: [],
      directories: [],
    };

    try {
      // Validate
      const validationError = await this.validate();
      if (validationError) {
        result.error = validationError;
        return result;
      }

      // Resolve templates directory
      const templatesDir = this.resolveTemplatesDir();
      this.log(`Using templates from: ${templatesDir}`);

      // Calculate target directory
      const targetDir = path.join(
        this.options.packageRoot,
        this.targetDirectory
      );

      // Process templates
      const processResult = await processTemplates({
        templatesDir,
        targetDir,
        filenameVariables: this.getFilenameVariables(),
        templateData: this.getTemplateData(),
        conditionalFlags: this.getConditionalFlags(),
        dryRun: this.options.dryRun,
      });

      result.files = processResult.createdFiles;
      result.directories = processResult.createdDirectories;

      // Display post-creation message if configured
      const postCreationMessage = this.getPostCreationMessage();
      if (postCreationMessage) {
        const variables = this.getMessageVariables();
        const message = interpolate(postCreationMessage.message, variables);
        console.log('');
        console.log(chalk.cyan('📝 Next steps:'));
        console.log(chalk.gray('─'.repeat(40)));
        console.log(message);
        console.log(chalk.gray('─'.repeat(40)));
        console.log('');
      }

      // Run lifecycle hooks
      const hookResult: ArtifactCreationResult = {
        type: this.artifactType,
        name: this.options.name,
        files: result.files,
        packageRoot: this.options.packageRoot,
      };

      await runHooks(this.options.config.hooks, hookResult);

      result.success = true;
    } catch (error) {
      result.error =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this.logError(result.error);
    }

    return result;
  }
}

/**
 * Helper to create a generator from configuration result
 */
export function createGeneratorOptions(
  name: string,
  configResult: LoadConfigResult,
  overrides: Partial<GeneratorOptions> = {}
): GeneratorOptions {
  return {
    name,
    packageRoot: configResult.packageRoot,
    monorepoRoot: configResult.monorepoRoot,
    config: configResult.config,
    dryRun: false,
    verbose: false,
    ...overrides,
  };
}
