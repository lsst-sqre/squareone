# Configuring file-factory for specific apps and packages

The .file-factory directory in each project/app provides customizations and configurations for file creation.

## Template Customization

Each package can override templates in `.file-factory/templates/`. The directory structure mirrors the output:

```
.file-factory/
├── config.mts          # Use .mts for Next.js apps
└── templates/
    └── component/
        └── {{ComponentName}}/
            ├── {{ComponentName}}.tsx.ejs    # Custom component template
            └── index.ts.ejs
```

## Configuration File

Create `.file-factory/config.mts` (or `config.ts`) in your package.

**Recommended**: Use `.mts` extension for packages without `"type": "module"` in package.json (like Next.js apps). The `.mts` extension explicitly marks the file as an ES module.

**Note**: The `defineConfig` import is optional - you can export a plain object. The CLI validates configs with Zod after loading. Use `defineConfig` only when you need TypeScript type hints during authoring in packages with `@lsst-sqre/file-factory` installed as a dependency.

```typescript
// Plain object export (recommended for apps like squareone)
export default {
  component: {
    directory: "src/components",
    styleSystem: "css-modules",
    withTest: true,
    withStory: true,
    appRouterBarrel: false,
    updateBarrels: [
      {
        file: "src/index.ts",
        template: "export * from './components/{{ComponentName}}';\n",
        position: "alphabetical",
      },
    ],
  },
  hook: {
    directory: "src/hooks",
    withTest: true,
    useDirectory: true,
  },
  context: {
    directory: "src/contexts",
  },
  page: {
    directory: "src/pages",
    router: "pages",
  },
};
```
