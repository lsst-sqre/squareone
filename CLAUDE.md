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

### App-specific commands
- `pnpm dev --filter squareone` - Start development server for squareone app only
- `pnpm build --filter squareone` - Build squareone app only
- `pnpm lint --filter squareone` - Lint squareone app only

### Testing commands
- `pnpm test-storybook --filter squared` - Run Storybook tests for squared package
- No Jest or other test frameworks are currently configured in most packages

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
- **`@lsst-sqre/squared`** - React component library (TypeScript)
- **`@lsst-sqre/global-css`** - Base CSS and design token application
- **`@lsst-sqre/rubin-style-dictionary`** - Design tokens built with style-dictionary
- **`@lsst-sqre/eslint-config`** - Shared ESLint configuration
- **`@lsst-sqre/tsconfig`** - Shared TypeScript configuration

## Key Architecture Patterns

### Next.js App Configuration
- Environment-specific configuration via YAML files (`squareone.config.yaml`, `squareone.serverconfig.yaml`)
- Runtime configuration accessible via `getConfig()` from Next.js
- Server-side rendering with styled-components
- Gafaelfawr integration for authentication
- Sentry integration for error tracking
- Plausible analytics integration

### React Component Architecture
- Functional components with hooks
- Component directories with index files for clean exports
- Styled-components for styling with design tokens from rubin-style-dictionary
- PropTypes for JavaScript components, TypeScript types for TypeScript components
- **Prefer `type` over `interface` for component props and simple object types**
- **Avoid using `React.FC` - type props directly in function parameters**
- Storybook for component documentation and testing

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

### Styling System
- Global CSS from `@lsst-sqre/global-css` package
- Design tokens from `@lsst-sqre/rubin-style-dictionary`
- styled-components for component-specific styling
- Font Awesome icons via `@fortawesome/react-fontawesome`
- CSS custom properties for design tokens

## Configuration Files
- **`turbo.json`** - Turborepo build pipeline configuration
- **`pnpm-workspace.yaml`** - pnpm workspace configuration
- **`apps/squareone/squareone.config.yaml`** - App-specific runtime configuration
- **`apps/squareone/next.config.js`** - Next.js configuration
- **`.github/copilot-instructions.md`** - Contains detailed coding patterns and conventions

## Important Development Notes
- Use TypeScript for new components in the squared package
- JavaScript is acceptable for Next.js pages in the squareone app (existing pattern)
- Follow existing import patterns: external libraries first, internal packages, then relative imports
- Always check existing components for patterns before creating new ones
- MDX is used for configurable page content in the squareone app