// Export plain object - defineConfig import not needed, loader validates config
export default {
  component: {
    directory: 'src/components',
    styleSystem: 'css-modules', // squared uses CSS Modules only
    withTest: true,
    withStory: true, // Generate Storybook stories
    appRouterBarrel: false, // Library doesn't use App Router
    postCreationMessage: {
      message: `Add the component to the package exports:

In src/index.ts, add:
   export * from './components/{{ComponentName}}';`,
    },
  },
  hook: {
    directory: 'src/hooks',
    withTest: true,
    useDirectory: true, // Hooks in their own directories
    postCreationMessage: {
      message: `Add the hook to the package exports:

1. In src/hooks/index.ts, add:
   export { {{hookName}} } from './{{hookName}}';

2. In src/index.ts, add:
   export { {{hookName}} } from './hooks/{{hookName}}';`,
    },
  },
  context: {
    directory: 'src/contexts',
    withTest: true,
    postCreationMessage: {
      message: `Add the context to the package exports:

In src/index.ts, add:
   export * from './contexts/{{ContextName}}';`,
    },
  },
};
