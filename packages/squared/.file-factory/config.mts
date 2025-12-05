// Export plain object - defineConfig import not needed, loader validates config
export default {
  component: {
    directory: 'src/components',
    styleSystem: 'css-modules', // squared uses CSS Modules only
    withTest: true,
    withStory: true, // Generate Storybook stories
    appRouterBarrel: false, // Library doesn't use App Router
    updateBarrels: [
      {
        file: 'src/components/index.ts',
        template: "export * from './{{ComponentName}}';\n",
        position: 'alphabetical',
      },
      {
        file: 'src/index.ts',
        template: "export * from './components/{{ComponentName}}';\n",
        position: 'alphabetical',
      },
    ],
  },
  hook: {
    directory: 'src/hooks',
    withTest: true,
    useDirectory: true, // Hooks in their own directories
    updateBarrels: [
      {
        file: 'src/hooks/index.ts',
        template: "export { {{hookName}} } from './{{hookName}}';\n",
        position: 'alphabetical',
      },
      {
        file: 'src/index.ts',
        template: "export { {{hookName}} } from './hooks/{{hookName}}';\n",
        position: 'alphabetical',
      },
    ],
  },
  context: {
    directory: 'src/contexts',
    withTest: true,
    updateBarrels: [
      {
        file: 'src/index.ts',
        template: "export * from './contexts/{{ContextName}}';\n",
        position: 'alphabetical',
      },
    ],
  },
};
