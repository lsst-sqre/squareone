// Export plain object - defineConfig import not needed, loader validates config
export default {
  component: {
    directory: 'src/components',
    styleSystem: 'css-modules',
    withTest: true,
    withStory: false,
    appRouterBarrel: false, // Still on Pages Router
  },
  hook: {
    directory: 'src/hooks',
    withTest: true,
    useDirectory: false,
  },
  context: {
    directory: 'src/contexts',
    withTest: true,
  },
  page: {
    directory: 'src/pages',
    router: 'pages', // Currently using Pages Router
  },
};
