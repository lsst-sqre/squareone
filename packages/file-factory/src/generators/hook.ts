import * as path from 'node:path';
import type { BarrelUpdate } from '../config/schema.js';
import { normalizeHookName, toKebabCase } from '../utils/naming.js';
import { pathExists } from '../utils/paths.js';
import { BaseGenerator, type GeneratorOptions } from './base.js';

/**
 * Hook-specific options
 */
export interface HookGeneratorOptions extends GeneratorOptions {
  /** Generate test file */
  withTest?: boolean;
  /** Create hook as a flat file (no directory) */
  flatFile?: boolean;
}

/**
 * Hook generator
 *
 * Creates React hooks with optional:
 * - Test files
 * - Directory structure (for complex hooks)
 */
export class HookGenerator extends BaseGenerator {
  protected override options: HookGeneratorOptions;
  private normalizedName: string;

  constructor(options: HookGeneratorOptions) {
    super(options);
    this.options = options;
    this.normalizedName = normalizeHookName(options.name);
  }

  get artifactType(): 'hook' {
    return 'hook';
  }

  get templateType(): string {
    return this.useDirectory ? 'hook-with-directory' : 'hook';
  }

  get targetDirectory(): string {
    // For directory-based hooks, the template creates the directory
    // For flat hooks, files go directly into the hooks directory
    return this.options.config.hook.directory;
  }

  /**
   * Get whether to use directory structure
   * Default is true (directory), unless flatFile option is set
   */
  private get useDirectory(): boolean {
    // If flatFile is explicitly set, invert it
    if (this.options.flatFile !== undefined) {
      return !this.options.flatFile;
    }
    // Otherwise use config default (now true)
    return this.options.config.hook.useDirectory;
  }

  /**
   * Get whether to include test files
   */
  private get withTest(): boolean {
    return this.options.withTest ?? this.options.config.hook.withTest;
  }

  getFilenameVariables(): Record<string, string> {
    return {
      hookName: this.normalizedName,
      'hook-name': toKebabCase(this.normalizedName),
    };
  }

  getTemplateData(): Record<string, unknown> {
    return {
      hookName: this.normalizedName,
      withTest: this.withTest,
      useDirectory: this.useDirectory,
    };
  }

  getConditionalFlags(): Record<string, boolean> {
    return {
      withTest: this.withTest,
    };
  }

  getBarrelUpdates(): BarrelUpdate[] {
    return this.options.config.hook.updateBarrels;
  }

  override getBarrelVariables(): Record<string, string> {
    return {
      hookName: this.normalizedName,
      'hook-name': toKebabCase(this.normalizedName),
    };
  }

  /**
   * Override validation for hooks
   */
  protected override async validate(): Promise<string | null> {
    const targetDir = path.join(this.options.packageRoot, this.targetDirectory);

    if (this.useDirectory) {
      // Check if hook directory exists
      const hookDir = path.join(targetDir, this.normalizedName);
      if (await pathExists(hookDir)) {
        return `Hook already exists at: ${hookDir}`;
      }
    } else {
      // Check if hook file exists
      const hookFile = path.join(targetDir, `${this.normalizedName}.ts`);
      if (await pathExists(hookFile)) {
        return `Hook already exists at: ${hookFile}`;
      }
    }

    return null;
  }
}

/**
 * Create and run a hook generator
 */
export async function generateHook(
  options: HookGeneratorOptions
): Promise<ReturnType<HookGenerator['run']>> {
  const generator = new HookGenerator(options);
  return generator.run();
}
