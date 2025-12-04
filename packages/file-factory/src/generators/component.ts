import type { BarrelUpdate, StyleSystem } from '../config/schema.js';
import { getComponentNames, getContextNames } from '../utils/naming.js';
import { BaseGenerator, type GeneratorOptions } from './base.js';

/**
 * Component-specific options
 */
export interface ComponentGeneratorOptions extends GeneratorOptions {
  /** Include a component-scoped context */
  withContext?: boolean;
  /** Generate test file */
  withTest?: boolean;
  /** Generate Storybook story */
  withStory?: boolean;
  /** Override the style system */
  styleSystem?: StyleSystem;
}

/**
 * Component generator
 *
 * Creates React components with optional:
 * - CSS Module styles
 * - styled-components styles
 * - Tailwind styles
 * - Test files
 * - Storybook stories
 * - Component-scoped contexts
 */
export class ComponentGenerator extends BaseGenerator {
  protected override options: ComponentGeneratorOptions;

  constructor(options: ComponentGeneratorOptions) {
    super(options);
    this.options = options;
  }

  get artifactType(): 'component' {
    return 'component';
  }

  get templateType(): string {
    return this.options.withContext ? 'component-with-context' : 'component';
  }

  get targetDirectory(): string {
    return this.options.config.component.directory;
  }

  /**
   * Get the effective style system (from options or config)
   */
  private get styleSystem(): StyleSystem {
    return (
      this.options.styleSystem ?? this.options.config.component.styleSystem
    );
  }

  /**
   * Get whether to include test files
   */
  private get withTest(): boolean {
    return this.options.withTest ?? this.options.config.component.withTest;
  }

  /**
   * Get whether to include story files
   */
  private get withStory(): boolean {
    return this.options.withStory ?? this.options.config.component.withStory;
  }

  getFilenameVariables(): Record<string, string> {
    const componentNames = getComponentNames(this.options.name);

    // For component-with-context, we also need context naming
    if (this.options.withContext) {
      const contextNames = getContextNames(this.options.name);
      return {
        ...componentNames,
        ContextName: contextNames.ContextName,
        ProviderName: contextNames.ProviderName,
      };
    }

    return componentNames;
  }

  getTemplateData(): Record<string, unknown> {
    const componentNames = getComponentNames(this.options.name);
    const contextNames = getContextNames(this.options.name);

    return {
      // Component names
      ...componentNames,
      // Context names (for component-with-context)
      ...contextNames,
      // Style system
      styleSystem: this.styleSystem,
      // Flags
      withContext: this.options.withContext ?? false,
      withTest: this.withTest,
      withStory: this.withStory,
      // Barrel pattern
      appRouterBarrel: this.options.config.component.appRouterBarrel,
    };
  }

  getConditionalFlags(): Record<string, boolean> {
    return {
      withTest: this.withTest,
      withStory: this.withStory,
      withCssModules: this.styleSystem === 'css-modules',
      withStyledComponents: this.styleSystem === 'styled-components',
      withTailwind: this.styleSystem === 'tailwind',
      withStyles: this.styleSystem !== 'none',
    };
  }

  getBarrelUpdates(): BarrelUpdate[] {
    return this.options.config.component.updateBarrels;
  }

  override getBarrelVariables(): Record<string, string> {
    const componentNames = getComponentNames(this.options.name);
    const contextNames = getContextNames(this.options.name);

    return {
      ...componentNames,
      ContextName: contextNames.ContextName,
      ProviderName: contextNames.ProviderName,
      consumerHookName: contextNames.consumerHookName,
    };
  }
}

/**
 * Create and run a component generator
 */
export async function generateComponent(
  options: ComponentGeneratorOptions
): Promise<ReturnType<ComponentGenerator['run']>> {
  const generator = new ComponentGenerator(options);
  return generator.run();
}
