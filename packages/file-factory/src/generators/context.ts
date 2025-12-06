import type { PostCreationMessage } from '../config/schema.js';
import { getContextNames } from '../utils/naming.js';
import { BaseGenerator, type GeneratorOptions } from './base.js';

/**
 * Context-specific options
 */
export interface ContextGeneratorOptions extends GeneratorOptions {
  /** Generate test file */
  withTest?: boolean;
}

/**
 * Context generator
 *
 * Creates global React context providers with:
 * - Context definition
 * - Provider component
 * - Consumer hook
 * - TypeScript types
 * - Optional test file
 *
 * Note: For component-scoped contexts, use the ComponentGenerator
 * with the `withContext` option instead.
 */
export class ContextGenerator extends BaseGenerator {
  protected override options: ContextGeneratorOptions;
  private contextNames: ReturnType<typeof getContextNames>;

  constructor(options: ContextGeneratorOptions) {
    super(options);
    this.options = options;
    this.contextNames = getContextNames(options.name);
  }

  get artifactType(): 'context' {
    return 'context';
  }

  get templateType(): string {
    return 'context';
  }

  get targetDirectory(): string {
    return this.options.config.context.directory;
  }

  /**
   * Get whether to include test files
   */
  private get withTest(): boolean {
    return this.options.withTest ?? this.options.config.context.withTest;
  }

  getFilenameVariables(): Record<string, string> {
    return {
      ContextName: this.contextNames.ContextName,
      ProviderName: this.contextNames.ProviderName,
      consumerHookName: this.contextNames.consumerHookName,
      contextDisplayName: this.contextNames.contextDisplayName,
      baseName: this.contextNames.baseName,
    };
  }

  getTemplateData(): Record<string, unknown> {
    return {
      ...this.contextNames,
      withTest: this.withTest,
    };
  }

  getConditionalFlags(): Record<string, boolean> {
    return {
      withTest: this.withTest,
    };
  }

  getPostCreationMessage(): PostCreationMessage | undefined {
    return this.options.config.context.postCreationMessage;
  }

  override getMessageVariables(): Record<string, string> {
    return {
      ContextName: this.contextNames.ContextName,
      ProviderName: this.contextNames.ProviderName,
      consumerHookName: this.contextNames.consumerHookName,
    };
  }
}

/**
 * Create and run a context generator
 */
export async function generateContext(
  options: ContextGeneratorOptions
): Promise<ReturnType<ContextGenerator['run']>> {
  const generator = new ContextGenerator(options);
  return generator.run();
}
