import * as path from 'node:path';
import type { Router } from '../config/schema.js';
import { getPageNames } from '../utils/naming.js';
import { pathExists } from '../utils/paths.js';
import { BaseGenerator, type GeneratorOptions } from './base.js';

/**
 * Page-specific options
 */
export interface PageGeneratorOptions extends GeneratorOptions {
  /** Override the router type */
  router?: Router;
}

/**
 * Page generator
 *
 * Creates Next.js pages for either:
 * - Pages Router (src/pages/path/page.tsx)
 * - App Router (src/app/path/page.tsx)
 */
export class PageGenerator extends BaseGenerator {
  protected override options: PageGeneratorOptions;
  private pageNames: ReturnType<typeof getPageNames>;

  constructor(options: PageGeneratorOptions) {
    super(options);
    this.options = options;
    this.pageNames = getPageNames(options.name);
  }

  get artifactType(): 'page' {
    return 'page';
  }

  get templateType(): string {
    return this.router === 'app' ? 'page-app' : 'page-pages';
  }

  /**
   * Get the effective router type
   */
  private get router(): Router {
    return this.options.router ?? this.options.config.page.router;
  }

  get targetDirectory(): string {
    const baseDir = this.options.config.page.directory;

    if (this.router === 'app') {
      // App Router: src/app/path/
      const pagePath = this.options.name;
      return path.join(baseDir, pagePath);
    } else {
      // Pages Router: src/pages/path/
      // For nested paths, we need the parent directory
      const segments = this.options.name.split('/');
      if (segments.length > 1) {
        return path.join(baseDir, ...segments.slice(0, -1));
      }
      return baseDir;
    }
  }

  getFilenameVariables(): Record<string, string> {
    return {
      pageName: this.pageNames.pageName,
      PageName: this.pageNames.PageName,
      pagePath: this.pageNames.pagePath,
    };
  }

  getTemplateData(): Record<string, unknown> {
    return {
      ...this.pageNames,
      router: this.router,
    };
  }

  getConditionalFlags(): Record<string, boolean> {
    return {
      isAppRouter: this.router === 'app',
      isPagesRouter: this.router === 'pages',
    };
  }

  getBarrelUpdates(): never[] {
    // Pages don't have barrel updates
    return [];
  }

  /**
   * Override validation for pages
   */
  protected override async validate(): Promise<string | null> {
    const baseDir = this.options.config.page.directory;
    let pagePath: string;

    if (this.router === 'app') {
      // App Router: check for page.tsx in the directory
      pagePath = path.join(
        this.options.packageRoot,
        baseDir,
        this.options.name,
        'page.tsx'
      );
    } else {
      // Pages Router: check for the page file
      pagePath = path.join(
        this.options.packageRoot,
        baseDir,
        `${this.options.name}.tsx`
      );
    }

    if (await pathExists(pagePath)) {
      return `Page already exists at: ${pagePath}`;
    }

    return null;
  }
}

/**
 * Create and run a page generator
 */
export async function generatePage(
  options: PageGeneratorOptions
): Promise<ReturnType<PageGenerator['run']>> {
  const generator = new PageGenerator(options);
  return generator.run();
}
