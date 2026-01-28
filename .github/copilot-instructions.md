# Squareone monorepo structure

This is a JavaScript/TypeScript front-end monorepo supporting multiple Rubin Observatory applications.

## Monorepo structure

### Apps

- [`squareone`](../apps/squareone) - Main RSP (Rubin Science Platform) landing page application built with Next.js/React

### Packages

- [`@lsst-sqre/squared`](../packages/squared) - React component library (TypeScript, CSS Modules, **NO BUILD STEP**)
- [`@lsst-sqre/global-css`](../packages/global-css) - Base CSS and design token application
- [`@lsst-sqre/rubin-style-dictionary`](../packages/rubin-style-dictionary) - Design tokens built with style-dictionary
- [`@lsst-sqre/eslint-config`](../packages/eslint-config) - Shared ESLint configuration (runs alongside Biome)
- [`@lsst-sqre/tsconfig`](../packages/tsconfig) - Shared TypeScript configuration

## Package management

- pnpm is used for package management with workspaces
- Turborepo is used for task running and build orchestration with remote caching. See [`turbo.json`](../turbo.json) for configuration
- Use Changesets for versioning and releasing packages (see [`.changeset/`](../.changeset/))

## Code quality tools

The monorepo uses **Biome** as the primary tool for linting and formatting:
- **Biome** - Fast, modern linting and formatting for JS/TS/JSON/CSS (see [`biome.json`](../biome.json))
- **ESLint** - Comprehensive rule coverage, framework-specific rules (runs via Turborepo)
- **Prettier** - YAML formatting only (Biome doesn't support YAML)

Both Biome and ESLint run in CI for thorough code quality validation

## Coding conventions

### General principles

- **Always use TypeScript** for new code in squared package; preferred for squareone app
- Use functional programming patterns where appropriate
- Follow existing naming conventions in each package/app

### Critical Architecture Patterns

⚠️ **IMPORTANT**: The following patterns are critical to the codebase architecture:

1. **Turborepo Remote Caching**
   - **Always run commands from repository root** with `--filter` flag (e.g., `pnpm build --filter squareone`)
   - **Never run scripts from individual package directories** - this bypasses remote caching
   - Only root-level scripts use `scripts/turbo-wrapper.js` for Turborepo cache authentication

2. **Squared Package NO BUILD STEP Architecture**
   - Squared exports **TypeScript source directly** - no transpilation/build step
   - **CSS Modules** for all styling
   - Apps consuming squared **must configure** `transpilePackages: ['@lsst-sqre/squared']` in next.config.js
   - See `packages/squared/package.json` - exports point to `src/index.ts`

3. **AppConfig System (squareone app)**
   - **NEVER use `next/config` or `getConfig()`** - deprecated pattern
   - Use **filesystem-based configuration** via YAML files (`squareone.config.yaml`, `squareone.serverconfig.yaml`)
   - Server components: `getStaticConfig()` from `src/lib/config/rsc`
   - Client components: `useStaticConfig()` hook from `src/hooks/useStaticConfig`
   - Kubernetes-ready configuration supporting runtime ConfigMap mounting

### Next.js apps

- Use Next.js for applications (App Router only, no Pages Router)
- Configure with `next.config.js` for **build-time settings only** (not runtime config)
- Use **AppConfig system** for runtime configuration (YAML files, not next/config)
- Must transpile squared package: `transpilePackages: ['@lsst-sqre/squared']`
- Error tracking with Sentry (injected via AppConfig system when configured)
- Analytics with Plausible (when configured)
- Authentication handled via Gafaelfawr integration

### React components

- Use functional components with hooks
- **Always use TypeScript** for new components in squared package
- **Prefer `type` over `interface`** for props definitions
- **Avoid `React.FC`** - type props directly in function parameters instead
- Use PropTypes for JavaScript components (legacy squareone), TypeScript types for TypeScript components
- Place components in their own directories with index files
- The main component's module should match the component's name
- Put internal components in other modules within the same directory
- Export components as default exports
- Create Storybook stories for new components in packages that support it (squared package)

### Styling

- **CSS Modules** - Use CSS Modules (`.module.css` files) for all component styling
- Use [`@lsst-sqre/global-css`](../packages/global-css) for global stylesheets
- **Always reference design tokens** from [@lsst-sqre/rubin-style-dictionary](../packages/rubin-style-dictionary) via CSS custom properties
- Design tokens available via CSS variables (e.g., `var(--rsd-color-primary-500)`)
- Use Font Awesome icons consistently

#### CSS Modules pattern

```typescript
import styles from './Component.module.css';

export default function Component() {
  return <div className={styles.container}>...</div>;
}
```

### File organization

- Use `.stories.js` or `.stories.tsx` files for Storybook stories
- Use `.test.js` or `.test.tsx` files for tests
- Use `index.js` or `index.ts` files for directory exports
- Follow the existing naming conventions in each app/package
- Organize imports: external libraries first, then internal packages, then relative imports

### Import patterns

Follow this import order:

```typescript
// 1. External libraries first
import React from 'react';
import { useState } from 'react';

// 2. Internal packages
import { Button } from '@lsst-sqre/squared';
import '@lsst-sqre/global-css';

// 3. Relative imports
import styles from './Component.module.css';
import SubComponent from './SubComponent';
```

- Use relative imports within the same package
- Use package names for cross-package imports (e.g., `@lsst-sqre/squared`)
- Import React hooks from 'react'
- Import Next.js utilities from their respective packages

### API and data patterns

- Use **TanStack Query** for data fetching and caching
- Create **custom hooks** for API interactions (e.g., `useUserInfo`, `useTimesSquarePage`)
- Handle loading and error states consistently
- Use proper TypeScript types for API responses
- Use **mock data** in `src/lib/mocks/` for development

### Times Square integration

Times Square is the notebook execution system integrated into squareone:

- **TimesSquareUrlParametersContext** for URL-based state management
- **TimesSquareHtmlEventsContext** for real-time SSE (Server-Sent Events) updates
- **GitHub PR preview support** at `/times-square/github-pr/:owner/:repo/:commit`
- **Mock API endpoints** in `/pages/api/dev/times-square/` for development

## Development commands

⚠️ **Always run commands from repository root** using `--filter` for targeted packages. Never run scripts from individual package directories.

### Main commands

```bash
# Development
pnpm dev              # Start development servers for all apps
pnpm storybook        # Start Storybook for all packages

# Building
pnpm build            # Build all packages and apps

# Linting and Formatting
pnpm biome:format     # Format code with Biome (JS/TS/JSON/CSS)
pnpm biome:format:check  # Check formatting without fixing
pnpm biome:lint       # Lint with Biome (allows warnings, fails on errors)
pnpm lint             # Lint with ESLint (via Turborepo)
pnpm prettier:yaml    # Format YAML files with Prettier
pnpm type-check       # Run TypeScript type checking

# Testing
pnpm test             # Run vitest tests
pnpm test-storybook   # Run Storybook tests

# Validation
pnpm localci          # Run full CI pipeline locally (formatting, linting, tests, build, Docker validation)
pnpm validate-docker  # Validate Dockerfile versions match package.json

# Documentation
pnpm docs             # Generate Sphinx documentation

# Versioning
npx changeset         # Create a changeset for versioning
```

### Targeted commands

Use `--filter` to target specific packages:

```bash
pnpm dev --filter squareone                # Start squareone dev server
pnpm build --filter @lsst-sqre/squared     # Build only squared package
pnpm test --filter @lsst-sqre/squared      # Test only squared package
pnpm storybook --filter @lsst-sqre/squared # Start Storybook for squared
```

## Testing

- **Unit tests**: Use vitest for component and unit testing
- **Storybook tests**: Use @storybook/addon-vitest for story-based tests
- **Test files**: Use `.test.js`, `.test.tsx` for test files
- **Run all tests**: `pnpm test`
- **Run Storybook tests**: `pnpm test-storybook`
- **Full CI pipeline**: `pnpm run localci` (runs all checks, builds, and tests)

## Configuration files

Key configuration files in the repository:

- **`turbo.json`** - Turborepo build pipeline configuration
- **`pnpm-workspace.yaml`** - pnpm workspace configuration
- **`apps/squareone/squareone.config.yaml`** - Public runtime configuration (client-accessible)
- **`apps/squareone/squareone.serverconfig.yaml`** - Server-only configuration (secrets)
- **`apps/squareone/squareone.config.schema.json`** - JSON schema for public config validation
- **`apps/squareone/next.config.js`** - Next.js build configuration (not runtime config)
- **`apps/squareone/src/content/pages/`** - Development MDX content files

## Additional resources

For comprehensive patterns and detailed guidance:

- **[`CLAUDE.md`](../CLAUDE.md)** - Comprehensive guide for Claude Code with detailed architecture patterns
- **`.claude/` directory** - Contains specialized Claude skills for deep domain knowledge:
  - `appconfig-system` - Configuration loading, YAML files, MDX content
  - `turborepo-workflow` - Build commands, remote caching, troubleshooting
  - `squared-package` - NO BUILD STEP architecture, CSS Modules, transpilation
  - `design-system` - Complete CSS variable reference, design tokens
  - `component-creation` - TypeScript patterns, CSS Modules, Storybook, tests
  - `testing-infrastructure` - Vitest, React Testing Library, Storybook tests
  - `times-square-integration` - Context providers, hooks, SSE, GitHub PR previews
  - `data-fetching-patterns` - TanStack Query patterns, custom hooks, error handling
  - `platform-api-integration` - OpenAPI specs, API discovery, authentication
- **`docs/dev/`** - Developer documentation including remote cache setup
