# Squareone monorepo structure

This is a JavaScript front-end monorepo supporting multiple Rubin Observatory applications.

## Monorepo structure

### Apps

- [`squareone`](../apps/squareone) - Main RSP landing page application (JavaScript/TypeScript mix)

### Packages

- [`@lsst-sqre/squared`](../packages/squared) - React component library (TypeScript)
- [`@lsst-sqre/global-css`](../packages/global-css) - Base CSS and design token application
- [`@lsst-sqre/rubin-style-dictionary`](../packages/rubin-style-dictionary) - Design tokens built with style-dictionary
- [`@lsst-sqre/eslint-config`](../packages/eslint-config) - Shared ESLint configuration
- [`@lsst-sqre/tsconfig`](../packages/tsconfig) - Shared TypeScript configuration

## Package management

- pnpm is used for package management with workspaces
- Turborepo is used for task running and build orchestration. See [`turbo.json`](../turbo.json) for configuration
- Use Changesets for versioning and releasing packages (see [`.changeset/`](../.changeset/))

## Coding conventions

### General principles

- Prefer TypeScript over JavaScript for new code where supported
- Use functional programming patterns where appropriate
- Follow existing naming conventions in each package/app

### Next.js apps

- Use Next.js for applications
- Configure with `next.config.js` for environment-specific settings
- Use public runtime configuration for environment-specific settings read through YAML configuration files
- Error tracking with Sentry (when configured)
- Analytics with Plausible (when configured)
- Authentication handled via Gafaelfawr integration

### React components

- Use functional components with hooks
- Use TypeScript for new components where supported
- Use PropTypes for JavaScript components, TypeScript interfaces for TypeScript components
- Place components in their own directories with index files
- The main component's module should match the component's name
- Put internal components in other modules within the same directory
- Export components as default exports
- Create Storybook stories for new components in packages that support it

### Styling

- Use styled-components for component-specific styles
- Use [`@lsst-sqre/global-css`](../packages/global-css) for global stylesheets
- Reference design tokens from [@lsst-sqre/rubin-style-dictionary](../packages/rubin-style-dictionary) via CSS custom properties imported from `@lsst-sqre/global-css`
- Follow the pattern: `const StyledComponent = styled.div\`...\`;`
- Use Font Awesome icons consistently

### File organization

- Use `.stories.js` or `.stories.tsx` files for Storybook stories
- Use `.test.js` or `.test.tsx` files for tests
- Use `index.js` or `index.ts` files for directory exports
- Follow the existing naming conventions in each app/package
- Organize imports: external libraries first, then internal packages, then relative imports

### Import patterns

- Use relative imports within the same package
- Use package names for cross-package imports (e.g., `@lsst-sqre/squared`)
- Import React hooks from 'react'
- Import Next.js utilities from their respective packages

### API and data patterns

- Use SWR for data fetching and caching
- Handle loading and error states consistently
- Use proper TypeScript types for API responses

## Development commands

- `pnpm dev` - Start development servers for all apps
- `pnpm dev --filter squareone` - Start development server for specific app
- `pnpm build` - Build all packages and apps
- `pnpm lint` - Run ESLint across all packages
- `pnpm storybook` - Start Storybook for all packages
- `npx changeset` - Create a changeset for versioning
