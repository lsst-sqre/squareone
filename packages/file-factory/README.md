# @lsst-sqre/file-factory

CLI tool to scaffold React components, hooks, context providers, and Next.js pages in the Squareone monorepo.

## Features

- **Directory-as-template pattern** - Templates mirror the output structure (like cookiecutter)
- **Component directory pattern** - `ComponentName/ComponentName.tsx` + `index.ts` barrel
- **Component-scoped contexts** - Create components with their own context using `--with-context`
- **Automatic barrel updates** - Keeps index files in sync with new exports
- **App Router support** - Handles barrel file quirks (`export { default }` only)
- **CSS Modules by default** - Modern styling approach with design tokens
- **TypeScript throughout** - Full type safety with Zod configuration validation
- **Package-specific configuration** - Each package can define its own templates and settings

## Installation

The package is installed as part of the monorepo workspace:

```bash
pnpm install
```

## Quick Start

```bash
# Create a component
pnpm file-factory component Button --package apps/squareone

# Create a component with context
pnpm file-factory component DataTable --with-context --package apps/squareone

# Create a hook
pnpm file-factory hook useDebounce --package apps/squareone

# Create a global context
pnpm file-factory context Theme --package apps/squareone

# Create a page
pnpm file-factory page dashboard/settings --package apps/squareone
```

## CLI Commands

### `file-factory component [name]`

Create a new React component.

```bash
Options:
  -p, --package <package>  Target package
  --with-context          Include component-scoped context
  --with-test             Include test file
  --no-test               Exclude test file
  --with-story            Include Storybook story
  --style <system>        Style system (css-modules, styled-components, tailwind, none)
  --dry-run               Preview without creating files
  -v, --verbose           Verbose output
```

### `file-factory hook [name]`

Create a new React hook. By default, hooks are created in their own directory with a barrel file for cleaner imports and co-located tests.

```bash
Options:
  -p, --package <package>  Target package
  --flat-file             Create hook as flat file (no directory)
  --with-test             Include test file
  --no-test               Exclude test file
  --dry-run               Preview without creating files
```

### `file-factory context [name]`

Create a new global React context.

```bash
Options:
  -p, --package <package>  Target package
  --with-test             Include test file
  --dry-run               Preview without creating files
```

### `file-factory page [path]`

Create a new Next.js page.

```bash
Options:
  -p, --package <package>  Target package
  --router <type>         Router type (app, pages)
  --dry-run               Preview without creating files
```

## Configuration

Create `.file-factory/config.ts` in your package:

```typescript
import { defineConfig } from '@lsst-sqre/file-factory';

export default defineConfig({
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
    useDirectory: true,
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
});
```

### Configuration Options

#### Component Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `directory` | `string` | `'src/components'` | Components directory |
| `styleSystem` | `'css-modules' \| 'styled-components' \| 'tailwind' \| 'none'` | `'css-modules'` | Style system |
| `withTest` | `boolean` | `true` | Generate test files |
| `withStory` | `boolean` | `false` | Generate Storybook stories |
| `appRouterBarrel` | `boolean` | `true` | Use App Router barrel pattern |
| `updateBarrels` | `BarrelUpdate[]` | `[]` | Barrel files to update |

#### Hook Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `directory` | `string` | `'src/hooks'` | Hooks directory |
| `withTest` | `boolean` | `true` | Generate test files |
| `useDirectory` | `boolean` | `true` | Create hooks in their own directory |
| `updateBarrels` | `BarrelUpdate[]` | `[]` | Barrel files to update |

#### Context Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `directory` | `string` | `'src/contexts'` | Contexts directory |
| `withTest` | `boolean` | `false` | Generate test files |
| `updateBarrels` | `BarrelUpdate[]` | `[]` | Barrel files to update |

#### Page Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `directory` | `string` | `'src/pages'` | Pages directory |
| `router` | `'app' \| 'pages'` | `'pages'` | Next.js router type |

### Barrel Updates

Automatically update index files when creating new artifacts:

```typescript
updateBarrels: [
  {
    file: 'src/index.ts',
    template: "export * from './components/{{ComponentName}}';\n",
    position: 'alphabetical', // 'append' | 'prepend' | 'alphabetical'
    skipIfExists: true,
  },
],
```

## Custom Templates

Override default templates by creating `.file-factory/templates/<type>/` in your package.

### Template Resolution Order

1. Package's `.file-factory/templates/<type>/`
2. Monorepo root's `.file-factory/templates/<type>/`
3. Built-in default templates

### Template Variables

| Variable | Example Input | Example Output |
|----------|---------------|----------------|
| `{{ComponentName}}` | "DataTable" | "DataTable" |
| `{{componentName}}` | "DataTable" | "dataTable" |
| `{{component-name}}` | "DataTable" | "data-table" |
| `{{hookName}}` | "useLocalStorage" | "useLocalStorage" |
| `{{ContextName}}` | "Theme" | "ThemeContext" |
| `{{ProviderName}}` | "Theme" | "ThemeProvider" |
| `{{consumerHookName}}` | "Theme" | "useTheme" |

### Conditional Files

Use `_when_<condition>_` prefix for conditional files:

```
component/
└── {{ComponentName}}/
    ├── {{ComponentName}}.tsx.ejs                    # Always included
    ├── _when_withTest_{{ComponentName}}.test.tsx.ejs   # Only with --with-test
    ├── _when_withStory_{{ComponentName}}.stories.tsx.ejs # Only with --with-story
    └── index.ts.ejs
```

## Programmatic API

```typescript
import {
  generateComponent,
  generateHook,
  generateContext,
  generatePage,
  loadConfig,
  createGeneratorOptions,
} from '@lsst-sqre/file-factory';

// Load configuration
const configResult = await loadConfig({
  packageRoot: '/path/to/package',
});

// Create generator options
const options = createGeneratorOptions('Button', configResult, {
  verbose: true,
});

// Generate component
const result = await generateComponent({
  ...options,
  withContext: true,
  withStory: true,
});

console.log(result.files); // Created files
```

## Development

```bash
# Build the package
pnpm build --filter @lsst-sqre/file-factory

# Run tests
pnpm test --filter @lsst-sqre/file-factory

# Watch mode
pnpm dev --filter @lsst-sqre/file-factory
```

## License

MIT
