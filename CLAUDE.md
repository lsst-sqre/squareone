# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Main commands (run from repository root)

- `pnpm dev` - Start development servers for all apps
- `pnpm build` - Build all packages and apps
- `pnpm lint` - Run ESLint across all packages
- `pnpm type-check` - Run TypeScript type checking
- `pnpm format` - Format code with Prettier
- `pnpm storybook` - Start Storybook for all packages
- `pnpm docs` - Generate Sphinx documentation for all packages

### App-specific commands

- `pnpm dev --filter squareone` - Start development server for squareone app only
- `pnpm build --filter squareone` - Build squareone app only
- `pnpm lint --filter squareone` - Lint squareone app only

### Testing commands

- `pnpm test` - Run vitest tests across all packages
- `pnpm test-storybook` - Run Storybook tests using vitest across all packages
- `pnpm test-storybook:watch` - Run Storybook tests in watch mode
- `pnpm test-storybook --filter @lsst-sqre/squared` - Run Storybook tests for squared package only
- Uses vitest as the test runner with Storybook addon-vitest for testing stories
- **Comprehensive testing** - Use the `test-suite-runner` agent (via Task tool) for running the full CI pipeline (`pnpm run localci`) and analyzing failures across all stages (formatting, linting, type-checking, testing, building)

### Version management

- `npx changeset` - Create a changeset for versioning new changes

## Repository Architecture

This is a **monorepo** for Rubin Observatory front-end applications managed with:

- **pnpm** for package management with workspaces
- **Turborepo** for build orchestration and caching
- **Changesets** for versioning and publishing

### Applications (`apps/`)

- **`squareone`** - Main RSP (Rubin Science Platform) landing page built with Next.js/React

### Packages (`packages/`)

- **`@lsst-sqre/squared`** - React component library (TypeScript, CSS Modules, no build step)
- **`@lsst-sqre/global-css`** - Base CSS and design token application
- **`@lsst-sqre/rubin-style-dictionary`** - Design tokens built with style-dictionary
- **`@lsst-sqre/eslint-config`** - Shared ESLint configuration
- **`@lsst-sqre/tsconfig`** - Shared TypeScript configuration

## Key Architecture Patterns

### Next.js App Configuration

- **Filesystem-based configuration** via YAML files (`squareone.config.yaml`, `squareone.serverconfig.yaml`)
- **AppConfig system** replaces `next/config` for runtime configuration
- **Server-side configuration loading** via `loadAppConfig()` in `getServerSideProps`
- **React Context-based** configuration access via `useAppConfig()` hook
- **Kubernetes-ready** configuration that supports runtime ConfigMap mounting
- **MDX content** loaded from filesystem (`src/content/pages/` in development, configurable via `mdxDir`)
- **Transpiles squared package** via Next.js `transpilePackages` configuration
- Server-side rendering with styled-components (for squareone app only)
- Gafaelfawr integration for authentication
- Sentry integration for error tracking (see Sentry Configuration section below)
- Plausible analytics integration

### React Component Architecture

- Functional components with hooks
- Component directories with index files for clean exports
- **CSS Modules for styling in squared package** with design tokens from rubin-style-dictionary
- Styled-components for styling in squareone app (legacy components)
- PropTypes for JavaScript components, TypeScript types for TypeScript components
- **Prefer `type` over `interface` for component props and simple object types**
- **Avoid using `React.FC` - type props directly in function parameters**
- Storybook for component documentation
- **Vitest for testing** - both unit tests and Storybook story tests via addon-vitest

### Times Square Integration

Times Square is a notebook execution system integrated into the squareone app:

- Use `TimesSquareUrlParametersContext` for URL-based state management
- Use `TimesSquareHtmlEventsContext` for real-time SSE (Server-Sent Events) updates
- GitHub PR preview support at `/times-square/github-pr/:owner/:repo/:commit` paths
- Mock API endpoints in `/pages/api/dev/times-square/` for development

### Data Fetching

- SWR for data fetching and caching
- Custom hooks for API interactions (e.g., `useUserInfo`, `useTimesSquarePage`)
- Mock data in `src/lib/mocks/` for development

### AppConfig System (Runtime Configuration)

The squareone app uses a filesystem-based configuration system that replaces `next/config`:

#### Configuration Loading

- **Server-side**: Use `loadAppConfig()` from `src/lib/config/loader.ts` in `getServerSideProps`
- **Client-side**: Use `useAppConfig()` hook from `src/contexts/AppConfigContext.tsx`
- **Configuration files**: `squareone.config.yaml` (public) and `squareone.serverconfig.yaml` (server-only)
- **Schema validation**: Ajv-based validation with default values and property removal

#### Sentry configuration loading

- **Server-side** (`sentry.server.config.js`): Sentry configuration is loaded from environment variables and injected into the AppConfig
- **Client-side** (`instrumentation-client.js`): Sentry configuration is injected into the browser via `window.__SENTRY_CONFIG__` in `_document.tsx`. This requires that pages implement `getServerSideProps` to enable configuration injection. Statically rendered pages get the default configuration which disables client-side Sentry reporting.

#### Page Pattern

```typescript
// In pages (e.g., pages/docs.tsx)
export const getServerSideProps: GetServerSideProps = async () => {
  const { config: appConfig, mdxSource } = await loadConfigAndMdx('docs.mdx');
  return { props: { appConfig, mdxSource } };
};
```

#### Component Pattern

```typescript
// In components
import { useAppConfig } from '../contexts/AppConfigContext';

function MyComponent() {
  const config = useAppConfig();
  return <div>{config.siteName}</div>;
}
```

#### MDX Content Loading

- **Development**: MDX files in `src/content/pages/` (relative path)
- **Production**: Configurable via `mdxDir` in YAML (absolute path for ConfigMaps)
- **Loading functions**: `loadMdxContent()` and `loadConfigAndMdx()` in config loader
- **Serialization**: Uses `next-mdx-remote` for server-side MDX processing

#### Key Benefits

- **Kubernetes-ready**: Configuration via ConfigMaps at runtime
- **No hydration issues**: No `next/config` or `getInitialProps` dependencies
- **Type-safe**: Full TypeScript support with `AppConfig` interface
- **Environment-agnostic**: Same system works in development and production
- **Content management**: MDX files separate from configuration, easier to edit

### Styling System

- Global CSS from `@lsst-sqre/global-css` package
- Design tokens from `@lsst-sqre/rubin-style-dictionary`
- **CSS Modules** for component-specific styling in squared package
- styled-components for component-specific styling in squareone app (legacy)
- Font Awesome icons via `@fortawesome/react-fontawesome`
- CSS custom properties for design tokens

## Configuration Files

- **`turbo.json`** - Turborepo build pipeline configuration
- **`pnpm-workspace.yaml`** - pnpm workspace configuration
- **`apps/squareone/squareone.config.yaml`** - Public runtime configuration (accessible client-side)
- **`apps/squareone/squareone.serverconfig.yaml`** - Server-only configuration (secrets, etc.)
- **`apps/squareone/squareone.config.schema.json`** - JSON schema for public config validation
- **`apps/squareone/squareone.serverconfig.schema.json`** - JSON schema for server config validation
- **`apps/squareone/next.config.js`** - Next.js configuration (no runtime config, only rewrites/webpack)
- **`apps/squareone/src/content/pages/`** - Development MDX content files
- **`apps/squareone/src/lib/config/loader.ts`** - Configuration and MDX loading utilities
- **`apps/squareone/src/contexts/AppConfigContext.tsx`** - React context for configuration
- **`.github/copilot-instructions.md`** - Contains detailed coding patterns and conventions

## Important Development Notes

### Squared Package Architecture (CRITICAL)

- **NO BUILD STEP** - The squared package exports TypeScript source directly
- **CSS Modules only** - No styled-components in squared package
- **Next.js transpilation** - Apps that consume squared must configure `transpilePackages: ['@lsst-sqre/squared']`
- **Direct source exports** - Package.json main/module fields point to `src/index.ts`
- **Testing with Vitest** - Both unit tests and Storybook story tests use vitest
- **No tsup** - Build tool removed in favor of app-level transpilation

### Turborepo Remote Caching (CRITICAL)

- **Always use root-level pnpm scripts** - Only the root `package.json` scripts use the wrapper (`scripts/turbo-wrapper.js`) that enables remote caching with authentication
- **Never run scripts from individual packages/apps** - Individual package.json scripts bypass the wrapper and remote caching
- **Use Turborepo filter syntax** - Target specific packages with `pnpm [script] --filter [package]` from repository root
- **Never call `turbo` directly** - Direct `turbo` calls bypass the wrapper and won't benefit from remote caching authentication
- **Exception for direct turbo calls** - Only acceptable when `TURBO_API`, `TURBO_TOKEN`, and `TURBO_TEAM` are already set as environment variables (e.g., in CI/CD pipelines or Docker builds)
- **Remote cache server** - Uses `https://roundtable.lsst.cloud/turborepo-cache` with Gafaelfawr authentication
- **Documentation** - See `docs/dev/remote-cache.rst` for detailed information about the remote caching system

Examples of correct vs incorrect usage:

```bash
# ✅ Correct: Root script with filter
pnpm test --filter @lsst-sqre/squared

# ❌ Wrong: Individual package script
cd packages/squared && pnpm test

# ❌ Wrong: Direct turbo call (unless env vars pre-set)
turbo run test --filter @lsst-sqre/squared
```

### Testing Infrastructure

- **Vitest configuration** - Configured in `vitest.config.ts` for unit tests
- **Storybook addon-vitest** - Tests stories directly in vitest environment
- **React Testing Library** - Primary testing utilities for component testing
- **Test setup** - Common test utilities in `src/test-setup.ts`
- **Running tests**: 
  - `pnpm test` - Run unit tests
  - `pnpm test-storybook` - Run Storybook story tests
  - `pnpm test-storybook:watch` - Watch mode for story tests

### Configuration System Migration (CRITICAL)

- **NEVER use `next/config` or `getConfig()`** - The app has been migrated away from this pattern
- **Use AppConfig system instead**: `loadAppConfig()` for server-side, `useAppConfig()` for client-side
- **No `getInitialProps`** except in `_document.tsx` (required for styled-components SSR)
- **All configuration must be loaded via `getServerSideProps`** and passed through React context
- **Environment variables**: Use direct `process.env` access for infrastructure concerns (Sentry config files)
- **Avoid `NEXT_PUBLIC_` environment variables** for runtime config - use YAML files instead

### Pages and Components

- **Pages requiring config**: Must use `getServerSideProps` with `loadAppConfig()` or `loadConfigAndMdx()`
- **Components needing config**: Use `useAppConfig()` hook, must be within `AppConfigProvider`
- **API routes**: Use `loadAppConfig()` directly for server-side configuration access
- **Storybook**: Uses `AppConfigProvider` decorator with mock configuration

### General Development

- Use TypeScript for new components in the squared package
- Follow existing import patterns: external libraries first, internal packages, then relative imports
- Always check existing components for patterns before creating new ones
- MDX content is loaded from filesystem, configured via `mdxDir` setting
