# CLAUDE.md

This file provides essential guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Reference

This is a **monorepo** for Rubin Observatory front-end applications managed with:

- **pnpm** - Package management with workspaces
- **Turborepo** - Build orchestration and caching
- **Changesets** - Versioning and publishing

### Applications (`apps/`)

- **`squareone`** - Main RSP (Rubin Science Platform) landing page built with Next.js/React

### Packages (`packages/`)

- **`@lsst-sqre/squared`** - React component library (TypeScript, CSS Modules, no build step)
- **`@lsst-sqre/global-css`** - Base CSS and design token application
- **`@lsst-sqre/rubin-style-dictionary`** - Design tokens built with style-dictionary
- **`@lsst-sqre/eslint-config`** - Shared ESLint configuration
- **`@lsst-sqre/tsconfig`** - Shared TypeScript configuration

## Development Commands

### Main Commands (run from repository root)

```bash
pnpm dev              # Start development servers
pnpm build            # Build all packages and apps
pnpm lint             # Run ESLint
pnpm type-check       # Run TypeScript type checking
pnpm format           # Format code with Prettier
pnpm test             # Run vitest tests
pnpm test-storybook   # Run Storybook tests
pnpm storybook        # Start Storybook
pnpm docs             # Generate Sphinx documentation
pnpm validate-docker  # Validate Dockerfile versions match package.json
npx changeset         # Create changeset for versioning
```

### Targeted Commands

Use `--filter` to target specific packages:

```bash
pnpm dev --filter squareone
pnpm build --filter @lsst-sqre/squared
pnpm test --filter @lsst-sqre/squared
```

⚠️ **Critical**: Always run commands from repository root with filters. Individual package scripts bypass Turborepo's remote caching. See **turborepo-workflow** skill for details.

## React Component Basics

- **Functional components** with hooks
- **TypeScript** preferred for new code
- **Prefer `type` over `interface`** for props
- **Avoid `React.FC`** - type props directly in function parameters
- **Component directories** with index files for clean exports
- **Default exports** for components
- **CSS Modules** for styling in squared package
- **styled-components** for styling in squareone app (legacy)

### Import Order

```typescript
// External libraries first
import React from 'react';
import { useState } from 'react';

// Internal packages
import { Button } from '@lsst-sqre/squared';
import '@lsst-sqre/global-css';

// Relative imports
import styles from './Component.module.css';
import SubComponent from './SubComponent';
```

## Key Architecture Patterns

### Next.js App (squareone)

- **Filesystem-based configuration** via YAML files (`squareone.config.yaml`, `squareone.serverconfig.yaml`)
- **AppConfig system** replaces `next/config` for runtime configuration
- **Server-side configuration loading** via `loadAppConfig()` in `getServerSideProps`
- **React Context-based** configuration access via `useAppConfig()` hook
- **MDX content** loaded from filesystem, configurable via `mdxDir`
- **Transpiles squared package** via `transpilePackages: ['@lsst-sqre/squared']`
- **Kubernetes-ready** configuration that supports runtime ConfigMap mounting

See **appconfig-system** skill for complete patterns.

### Squared Package Architecture

⚠️ **Critical**: Squared has NO BUILD STEP - exports TypeScript source directly.

- **CSS Modules only** - No styled-components in squared
- **Apps must transpile** - Configure `transpilePackages: ['@lsst-sqre/squared']`
- **Direct source exports** - package.json points to `src/index.ts`
- **Testing with Vitest** - Both unit tests and Storybook tests

See **squared-package** skill for complete architecture.

### Data Fetching

- **SWR** for data fetching and caching
- **Custom hooks** for API interactions (e.g., `useUserInfo`, `useTimesSquarePage`)
- **Mock data** in `src/lib/mocks/` for development

See **data-fetching-patterns** skill for complete patterns.

### Times Square Integration

- **TimesSquareUrlParametersContext** for URL-based state management
- **TimesSquareHtmlEventsContext** for real-time SSE updates
- **GitHub PR preview support** at `/times-square/github-pr/:owner/:repo/:commit`
- **Mock API endpoints** in `/pages/api/dev/times-square/` for development

See **times-square-integration** skill for complete patterns.

## Specialized Skills

For detailed guidance on specific topics, Claude has access to specialized skills that provide comprehensive patterns, templates, and troubleshooting:

- **appconfig-system** - Configuration loading, YAML files, MDX content, Sentry config injection
- **turborepo-workflow** - Build commands, remote caching, filter syntax, troubleshooting
- **squared-package** - NO BUILD STEP architecture, CSS Modules, transpilation, testing
- **design-system** - Complete CSS variable reference, design tokens, colors, spacing, typography
- **component-creation** - TypeScript patterns, CSS Modules with design tokens, Storybook, tests
- **testing-infrastructure** - Vitest, React Testing Library, Storybook tests, CI pipeline
- **times-square-integration** - Context providers, hooks, SSE, GitHub PR previews
- **data-fetching-patterns** - SWR patterns, custom hooks, error handling, mock data
- **platform-api-integration** - OpenAPI specs, API discovery, hook patterns, authentication
- **migrate-styled-components-to-css-modules** - Converting styled-components to CSS Modules
- **docker-version-validation** - Dockerfile version synchronization, validation rules, troubleshooting

These skills automatically activate when relevant or can be referenced explicitly. See `.claude/README.md` for complete skill documentation.

## Configuration Files

- **`turbo.json`** - Turborepo build pipeline configuration
- **`pnpm-workspace.yaml`** - pnpm workspace configuration
- **`apps/squareone/squareone.config.yaml`** - Public runtime configuration (client-accessible)
- **`apps/squareone/squareone.serverconfig.yaml`** - Server-only configuration (secrets)
- **`apps/squareone/squareone.config.schema.json`** - JSON schema for public config validation
- **`apps/squareone/next.config.js`** - Next.js configuration (no runtime config, only build config)
- **`apps/squareone/src/content/pages/`** - Development MDX content files
- **`.github/copilot-instructions.md`** - Contains detailed coding patterns and conventions

## Important Development Notes

### Critical Patterns

1. **Turborepo Remote Caching**
   - **Always use root-level pnpm scripts** (e.g., `pnpm build --filter squareone`)
   - **Never run scripts from individual packages** (bypasses remote caching)
   - Only root scripts use `scripts/turbo-wrapper.js` for authentication
   - See **turborepo-workflow** skill for complete details

2. **Configuration System**
   - **NEVER use `next/config` or `getConfig()`** - Use AppConfig system instead
   - Server-side: `loadAppConfig()` in `getServerSideProps`
   - Client-side: `useAppConfig()` hook
   - See **appconfig-system** skill for complete patterns

3. **Squared Package**
   - **NO BUILD STEP** - exports TypeScript source directly
   - **CSS Modules only** - No styled-components in squared
   - Apps must configure `transpilePackages: ['@lsst-sqre/squared']`
   - See **squared-package** skill for complete architecture

## Testing

### Quick Commands

```bash
pnpm test                              # Run unit tests
pnpm test --filter @lsst-sqre/squared  # Test specific package
pnpm test-storybook                     # Run Storybook tests
pnpm test-storybook:watch               # Watch mode
```

### Comprehensive Testing

Use the `test-suite-runner` agent (via Task tool) for running the full CI pipeline (`pnpm run localci`) and analyzing failures across all stages.

See **testing-infrastructure** skill for complete patterns.

## General Development Guidelines

1. **Use TypeScript** for new components in squared package
2. **Follow import conventions** - external → internal → relative
3. **Check existing components** for patterns before creating new ones
4. **Write tests** for components (unit or story tests)
5. **Document with JSDoc** for public APIs
6. **Use design tokens** (CSS variables) for all styling values (see **design-system** skill)
7. **Run linting and type-checking** before committing
8. **Create changesets** for changes (`npx changeset`)

## Getting Detailed Help

This file provides essential context. For detailed patterns, templates, and troubleshooting:

- **Specific topics**: Reference the appropriate skill (skills activate automatically)
- **Skills directory**: See `.claude/README.md` for complete skill documentation
- **Coding conventions**: See `.github/copilot-instructions.md` for detailed patterns
- **Remote caching**: See `docs/dev/remote-cache.rst` for infrastructure details

When in doubt, ask Claude - the specialized skills will activate automatically to provide detailed guidance!
