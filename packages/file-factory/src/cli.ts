import { confirm, input, select } from '@inquirer/prompts';
import chalk from 'chalk';
import { Command } from 'commander';
import {
  findMonorepoRoot,
  loadConfig,
  resolvePackageDir,
} from './config/index.js';
import type { Router, StyleSystem } from './config/schema.js';
import {
  createGeneratorOptions,
  generateComponent,
  generateContext,
  generateHook,
  generatePage,
} from './generators/index.js';

const program = new Command();

// Package version - will be replaced during build
const VERSION = '0.1.0';

program
  .name('file-factory')
  .description(
    'CLI tool to scaffold React components, hooks, contexts, and pages'
  )
  .version(VERSION);

/**
 * Resolve package root from CLI options
 */
async function resolvePackageRoot(packageOption?: string): Promise<string> {
  const cwd = process.cwd();
  const monorepoRoot = findMonorepoRoot(cwd);

  if (packageOption && monorepoRoot) {
    const resolved = resolvePackageDir(packageOption, monorepoRoot);
    if (!resolved) {
      console.error(chalk.red(`Could not find package: ${packageOption}`));
      process.exit(1);
    }
    return resolved;
  }

  // Use current directory's package
  return cwd;
}

/**
 * Print generation results
 */
function printResults(
  type: string,
  name: string,
  result: { success: boolean; files: string[]; error?: string }
): void {
  if (result.success) {
    console.log(chalk.green(`\n✓ Created ${type}: ${name}`));
    console.log(chalk.dim('\nFiles created:'));
    for (const file of result.files) {
      console.log(chalk.dim(`  ${file}`));
    }
  } else {
    console.error(chalk.red(`\n✗ Failed to create ${type}: ${name}`));
    if (result.error) {
      console.error(chalk.red(`  ${result.error}`));
    }
    process.exit(1);
  }
}

// ============================================================================
// Component Command
// ============================================================================

program
  .command('component [name]')
  .description('Create a new React component')
  .option(
    '-p, --package <package>',
    'Target package (e.g., @lsst-sqre/squared)'
  )
  .option('--with-context', 'Include a component-scoped context')
  .option('--with-test', 'Include test file (default from config)')
  .option('--no-test', 'Exclude test file')
  .option('--with-story', 'Include Storybook story')
  .option('--no-story', 'Exclude Storybook story')
  .option(
    '--style <system>',
    'Style system (css-modules, styled-components, tailwind, none)'
  )
  .option('--dry-run', 'Show what would be created without writing files')
  .option('-v, --verbose', 'Verbose output')
  .action(async (name: string | undefined, options) => {
    // Interactive mode if no name provided
    if (!name) {
      name = await input({
        message: 'Component name (PascalCase):',
        validate: (value) =>
          value.length > 0 ? true : 'Component name is required',
      });

      const withContext = await confirm({
        message: 'Include a component-scoped context?',
        default: false,
      });

      options.withContext = withContext;
    }

    const packageRoot = await resolvePackageRoot(options.package);
    const configResult = await loadConfig({ packageRoot });

    const generatorOptions = createGeneratorOptions(name, configResult, {
      dryRun: options.dryRun,
      verbose: options.verbose,
    });

    const result = await generateComponent({
      ...generatorOptions,
      withContext: options.withContext,
      withTest: options.test,
      withStory: options.story ?? options.withStory,
      styleSystem: options.style as StyleSystem | undefined,
    });

    printResults('component', name, result);
  });

// ============================================================================
// Hook Command
// ============================================================================

program
  .command('hook [name]')
  .description('Create a new React hook')
  .option(
    '-p, --package <package>',
    'Target package (e.g., @lsst-sqre/squared)'
  )
  .option('--flat-file', 'Create hook as a flat file instead of a directory')
  .option('--with-test', 'Include test file (default from config)')
  .option('--no-test', 'Exclude test file')
  .option('--dry-run', 'Show what would be created without writing files')
  .option('-v, --verbose', 'Verbose output')
  .action(async (name: string | undefined, options) => {
    // Interactive mode if no name provided
    if (!name) {
      name = await input({
        message: 'Hook name (useXxx):',
        validate: (value) =>
          value.length > 0 ? true : 'Hook name is required',
      });
    }

    const packageRoot = await resolvePackageRoot(options.package);
    const configResult = await loadConfig({ packageRoot });

    const generatorOptions = createGeneratorOptions(name, configResult, {
      dryRun: options.dryRun,
      verbose: options.verbose,
    });

    const result = await generateHook({
      ...generatorOptions,
      flatFile: options.flatFile,
      withTest: options.test,
    });

    printResults('hook', name, result);
  });

// ============================================================================
// Context Command
// ============================================================================

program
  .command('context [name]')
  .description('Create a new global React context')
  .option(
    '-p, --package <package>',
    'Target package (e.g., @lsst-sqre/squared)'
  )
  .option('--with-test', 'Include test file')
  .option('--no-test', 'Exclude test file')
  .option('--dry-run', 'Show what would be created without writing files')
  .option('-v, --verbose', 'Verbose output')
  .action(async (name: string | undefined, options) => {
    // Interactive mode if no name provided
    if (!name) {
      name = await input({
        message: 'Context name (e.g., Theme, Auth):',
        validate: (value) =>
          value.length > 0 ? true : 'Context name is required',
      });
    }

    const packageRoot = await resolvePackageRoot(options.package);
    const configResult = await loadConfig({ packageRoot });

    const generatorOptions = createGeneratorOptions(name, configResult, {
      dryRun: options.dryRun,
      verbose: options.verbose,
    });

    const result = await generateContext({
      ...generatorOptions,
      withTest: options.test,
    });

    printResults('context', name, result);
  });

// ============================================================================
// Page Command
// ============================================================================

program
  .command('page [path]')
  .description('Create a new Next.js page')
  .option('-p, --package <package>', 'Target package (e.g., apps/squareone)')
  .option('--router <type>', 'Router type (app, pages)')
  .option('--dry-run', 'Show what would be created without writing files')
  .option('-v, --verbose', 'Verbose output')
  .action(async (pagePath: string | undefined, options) => {
    // Interactive mode if no path provided
    if (!pagePath) {
      pagePath = await input({
        message: 'Page path (e.g., dashboard/settings):',
        validate: (value) =>
          value.length > 0 ? true : 'Page path is required',
      });

      if (!options.router) {
        options.router = await select({
          message: 'Router type:',
          choices: [
            { name: 'Pages Router', value: 'pages' },
            { name: 'App Router', value: 'app' },
          ],
        });
      }
    }

    const packageRoot = await resolvePackageRoot(options.package);
    const configResult = await loadConfig({ packageRoot });

    const generatorOptions = createGeneratorOptions(pagePath, configResult, {
      dryRun: options.dryRun,
      verbose: options.verbose,
    });

    const result = await generatePage({
      ...generatorOptions,
      router: options.router as Router | undefined,
    });

    printResults('page', pagePath, result);
  });

// ============================================================================
// Interactive Mode (default)
// ============================================================================

program
  .command('create', { isDefault: true })
  .description('Interactive mode to create any artifact')
  .option('-p, --package <package>', 'Target package')
  .action(async (options) => {
    const artifactType = await select({
      message: 'What would you like to create?',
      choices: [
        { name: 'Component', value: 'component' },
        { name: 'Hook', value: 'hook' },
        { name: 'Context (global)', value: 'context' },
        { name: 'Page', value: 'page' },
      ],
    });

    // Delegate to the appropriate command
    const args = options.package ? ['-p', options.package] : [];

    switch (artifactType) {
      case 'component':
        await program.parseAsync([
          'node',
          'file-factory',
          'component',
          ...args,
        ]);
        break;
      case 'hook':
        await program.parseAsync(['node', 'file-factory', 'hook', ...args]);
        break;
      case 'context':
        await program.parseAsync(['node', 'file-factory', 'context', ...args]);
        break;
      case 'page':
        await program.parseAsync(['node', 'file-factory', 'page', ...args]);
        break;
    }
  });

// Parse CLI arguments
program.parse();
