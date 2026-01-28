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
- **`@lsst-sqre/eslint-config`** - Shared ESLint configuration (runs alongside Biome)
- **`@lsst-sqre/tsconfig`** - Shared TypeScript configuration

### Code Quality Tools

The monorepo uses **Biome** as the primary tool for linting and formatting:
- **Biome** - Fast, modern linting and formatting for JS/TS/JSON/CSS (see `biome.json`)
- **ESLint** - Comprehensive rule coverage, framework-specific rules (runs via Turborepo)
- **Prettier** - YAML formatting only (Biome doesn't support YAML)

Both Biome and ESLint run in CI for thorough code quality validation.

## Development Commands

### Main Commands (run from repository root)

```bash
# Development
pnpm dev              # Start development servers
pnpm storybook        # Start Storybook

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
- **CSS Modules** for styling in both squared package and squareone app

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

- **App Router only** — all pages use the Next.js App Router (no Pages Router)
- **Filesystem-based configuration** via YAML files (`squareone.config.yaml`, `squareone.serverconfig.yaml`)
- **Server-side configuration** via `getStaticConfig()` (RSC cached loader) in server components
- **Client-side configuration** via `useStaticConfig()` hook (resolves config from `ConfigProvider`)
- **MDX content** compiled via `compileMdxForRsc()` for server components
- **Transpiles squared package** via `transpilePackages: ['@lsst-sqre/squared']`
- **Kubernetes-ready** configuration that supports runtime ConfigMap mounting

See **appconfig-system** skill for complete patterns.

### Squared Package Architecture

⚠️ **Critical**: Squared has NO BUILD STEP - exports TypeScript source directly.

- **CSS Modules** - All styling uses CSS Modules
- **Apps must transpile** - Configure `transpilePackages: ['@lsst-sqre/squared']`
- **Direct source exports** - package.json points to `src/index.ts`
- **Testing with Vitest** - Both unit tests and Storybook tests

See **squared-package** skill for complete architecture.

### Data Fetching

- **TanStack Query** for data fetching and caching
- **Custom hooks** for API interactions (e.g., `useUserInfo`, `useTimesSquarePage`)
- **Mock data** in `src/lib/mocks/` for development

See **data-fetching-patterns** skill for complete patterns.

### Times Square Integration

- **TimesSquareUrlParametersContext** for URL-based state management
- **TimesSquareHtmlEventsContext** for real-time SSE updates
- **GitHub PR preview support** at `/times-square/github-pr/:owner/:repo/:commit`
- **Mock API endpoints** in `/app/api/dev/times-square/` for development

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
- **data-fetching-patterns** - TanStack Query patterns, custom hooks, error handling, mock data
- **platform-api-integration** - OpenAPI specs, API discovery, hook patterns, authentication
- **docker-version-validation** - Dockerfile version synchronization, validation rules, troubleshooting
- **file-factory** - CLI scaffolding for components, hooks, contexts, pages with consistent structure

These skills automatically activate when relevant or can be referenced explicitly. See `.claude/README.md` for complete skill documentation.

## Configuration Files

- **`biome.json`** - Biome linting and formatting configuration
- **`turbo.json`** - Turborepo build pipeline configuration
- **`pnpm-workspace.yaml`** - pnpm workspace configuration
- **`apps/squareone/squareone.config.yaml`** - Public runtime configuration (client-accessible)
- **`apps/squareone/squareone.serverconfig.yaml`** - Server-only configuration (secrets)
- **`apps/squareone/squareone.config.schema.json`** - JSON schema for public config validation
- **`apps/squareone/next.config.js`** - Next.js configuration (no runtime config, only build config)
- **`apps/squareone/src/content/pages/`** - Development MDX content files
- **`packages/eslint-config/`** - Shared ESLint configuration
- **`.github/copilot-instructions.md`** - Contains detailed coding patterns and conventions

## Important Development Notes

### Critical Patterns

1. **Turborepo Remote Caching**
   - **Always use root-level pnpm scripts** (e.g., `pnpm build --filter squareone`)
   - **Never run scripts from individual packages** (bypasses remote caching)
   - Only root scripts use `scripts/turbo-wrapper.js` for authentication
   - See **turborepo-workflow** skill for complete details

2. **Configuration System**
   - **NEVER use `next/config` or `getConfig()`** - Use the RSC config system instead
   - Server components: `getStaticConfig()` from `src/lib/config/rsc`
   - Client components: `useStaticConfig()` hook from `src/hooks/useStaticConfig`
   - See **appconfig-system** skill for complete patterns

3. **Squared Package**
   - **NO BUILD STEP** - exports TypeScript source directly
   - **CSS Modules** - All styling uses CSS Modules
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
