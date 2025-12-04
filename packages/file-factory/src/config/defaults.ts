import type { FileFactoryConfig } from './schema.js';

/**
 * Default configuration for file-factory
 *
 * These defaults are used when no configuration file is found
 * or for any values not specified in the configuration.
 */
export const defaultConfig: FileFactoryConfig = {
  component: {
    directory: 'src/components',
    styleSystem: 'css-modules',
    withTest: true,
    withStory: false,
    appRouterBarrel: true,
    updateBarrels: [],
  },
  hook: {
    directory: 'src/hooks',
    withTest: true,
    useDirectory: false,
    updateBarrels: [],
  },
  context: {
    directory: 'src/contexts',
    withTest: false,
    updateBarrels: [],
  },
  page: {
    directory: 'src/pages',
    router: 'pages',
  },
  hooks: {},
};
