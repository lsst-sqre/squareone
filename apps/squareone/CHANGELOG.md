# squareone

## 0.31.1

### Patch Changes

- [#405](https://github.com/lsst-sqre/squareone/pull/405) [`1fe8816`](https://github.com/lsst-sqre/squareone/commit/1fe8816b415a23cf1b18e05517e291afbbfd441e) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @biomejs/biome from 2.3.12 to 2.3.14

- [#405](https://github.com/lsst-sqre/squareone/pull/405) [`1fe8816`](https://github.com/lsst-sqre/squareone/commit/1fe8816b415a23cf1b18e05517e291afbbfd441e) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @types/node from 22.19.7 to 22.19.11

- [#400](https://github.com/lsst-sqre/squareone/pull/400) [`f935c90`](https://github.com/lsst-sqre/squareone/commit/f935c902c98913adbe853bcd086124448b9498b2) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @types/react from 19.2.13 to 19.2.14 in the react group

- [#405](https://github.com/lsst-sqre/squareone/pull/405) [`1fe8816`](https://github.com/lsst-sqre/squareone/commit/1fe8816b415a23cf1b18e05517e291afbbfd441e) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @vitejs/plugin-react from 5.1.2 to 5.1.4

- [#405](https://github.com/lsst-sqre/squareone/pull/405) [`1fe8816`](https://github.com/lsst-sqre/squareone/commit/1fe8816b415a23cf1b18e05517e291afbbfd441e) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump dotenv from 17.2.3 to 17.2.4

- [#405](https://github.com/lsst-sqre/squareone/pull/405) [`1fe8816`](https://github.com/lsst-sqre/squareone/commit/1fe8816b415a23cf1b18e05517e291afbbfd441e) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump glob from 13.0.1 to 13.0.2

- [#399](https://github.com/lsst-sqre/squareone/pull/399) [`36a7ebe`](https://github.com/lsst-sqre/squareone/commit/36a7ebe62e8469a9ba31a1138543ead1203b84e2) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump imjasonh/setup-crane from 0.4 to 0.5 in the actions group

## 0.31.0

### Minor Changes

- [#354](https://github.com/lsst-sqre/squareone/pull/354) [`2d91039`](https://github.com/lsst-sqre/squareone/commit/2d910391d908c9c573969c9246965a82debe9a49) Thanks [@jonathansick](https://github.com/jonathansick)! - Migrated four pages from Pages Router to App Router:

  - Home page (`/`)
  - Docs page (`/docs`)
  - Support page (`/support`)
  - API Aspect page (`/api-aspect`)

  Created the App Router foundation:

  - Root layout (`src/app/layout.tsx`) with PageShell integration
  - Providers wrapper (`src/app/providers.tsx`) for theme and config contexts
  - Force dynamic rendering to support runtime configuration loading

- [#383](https://github.com/lsst-sqre/squareone/pull/383) [`0d1bfc3`](https://github.com/lsst-sqre/squareone/commit/0d1bfc38b421c044c1483d3efcf0bb7771a9bc31) Thanks [@jonathansick](https://github.com/jonathansick)! - Integrate BroadcastBannerStack with Semaphore API via semaphore-client

  The BroadcastBannerStack component now fetches broadcast messages from the Semaphore API using the new `@lsst-sqre/semaphore-client` package. Key changes:

  - Prefetch broadcasts in the root layout using service discovery for the Semaphore API URL
  - Consolidate BroadcastBannerStack as a client component with React Query hydration
  - Remove the legacy maintenance category from BroadcastBanner
  - Add a mock Semaphore API endpoint (`/api/dev/semaphore/v1/broadcasts`) for local development

- [#385](https://github.com/lsst-sqre/squareone/pull/385) [`a713c75`](https://github.com/lsst-sqre/squareone/commit/a713c75b11ea5e51b1a60c81e21f75932771dc6f) Thanks [@jonathansick](https://github.com/jonathansick)! - Complete Pages Router removal

  Migrated the remaining Pages Router pages to App Router and deleted the entire `src/pages/` directory:

  - **terms page**: Migrated to `src/app/terms/page.tsx` as a server component
  - **enrollment pages**: Migrated 4 enrollment status pages (`pending-approval`, `pending-confirmation`, `thanks-for-signing-up`, `thanks-for-verifying`) to `src/app/enrollment/` using RSC MDX compilation via `compileMdxForRsc()`
  - **Deleted framework files**: `_app.tsx`, `_document.tsx`, `_error.tsx` (App Router uses `layout.tsx`, `error.tsx`)
  - **Deleted dev-only pages**: `login.tsx`, `logout.tsx`, `sentry-example-page.tsx`, `api/sentry-example-api.ts`
  - **Deleted legacy modules**: `AppConfigContext.tsx` (replaced by RSC `ConfigProvider`), `footerLoader.ts` (Pages Router MDX serialization), `loadConfigAndMdx()` helper

  Simplified `useStaticConfig` to only support the App Router `ConfigProvider` path, removing the `AppConfigContext` fallback branch. The `AppConfigContextValue` type is now re-exported from `useStaticConfig` for backward compatibility.

  squareone is now fully App Router — no Pages Router code remains.

- [#385](https://github.com/lsst-sqre/squareone/pull/385) [`a03bd17`](https://github.com/lsst-sqre/squareone/commit/a03bd17f21b7ae2d089bf8b8a9500cf9de2184ff) Thanks [@jonathansick](https://github.com/jonathansick)! - Add pino structured logging for server-side code

  - Replaced `console.*` calls in server-side code with pino structured JSON logging
  - Production outputs GKE-compatible JSON to stdout; development uses pino-pretty for readable output
  - Log level configurable via `LOG_LEVEL` environment variable (defaults to `info` in production, `debug` in development)
  - Config loading and MDX loading messages moved to `debug` level to reduce production noise
  - API route handlers use child loggers with route context for easier tracing
  - Client-side components remain unchanged (Sentry handles client error reporting)

- [#354](https://github.com/lsst-sqre/squareone/pull/354) [`2d91039`](https://github.com/lsst-sqre/squareone/commit/2d910391d908c9c573969c9246965a82debe9a49) Thanks [@jonathansick](https://github.com/jonathansick)! - New React Server Components-compatible utilities for loading server-side configuration and MDX content

  - **Config loading** (`src/lib/config/rsc/loader.ts`): Server-side configuration loading using React's `cache()` for request deduplication
  - **MDX compilation** (`src/lib/mdx/rsc/compiler.ts`): RSC-compatible MDX content compilation for server components
  - **ConfigProvider** (`src/contexts/rsc/ConfigProvider.tsx`): Context provider using React 19's `use()` hook to bridge server-loaded config to client components
  - **useStaticConfig** hook (`src/hooks/useStaticConfig.ts`) provides seamless configuration access across both router patterns

  These utilities enable the same configuration and content patterns used in Pages Router while leveraging RSC benefits like reduced client bundle size.

- [#357](https://github.com/lsst-sqre/squareone/pull/357) [`8d837f6`](https://github.com/lsst-sqre/squareone/commit/8d837f68b671f2f4ecafd41cc3d97ab4958c0baa) Thanks [@jonathansick](https://github.com/jonathansick)! - New `@lsst-sqre/repertoire-client` package for Rubin Science Platform service discovery

  This package provides a reusable client for the Repertoire API, enabling dynamic service discovery across monorepo apps:

  - **Zod schemas** for runtime validation of API responses
  - **ServiceDiscoveryQuery** class with convenience methods for querying applications, services, and datasets
  - **TanStack Query integration** with `discoveryQueryOptions()` for server prefetching and client-side caching
  - **useServiceDiscovery hook** for client components with automatic hydration support
  - **Mock data** for development and testing

  Integrated into squareone:

  - Added TanStack Query providers with server-side prefetching in root layout
  - Components can now use `useServiceDiscovery()` to check service availability
  - Service URLs dynamically discovered instead of hard-coded in configuration

- [#368](https://github.com/lsst-sqre/squareone/pull/368) [`0b3f783`](https://github.com/lsst-sqre/squareone/commit/0b3f783f6e2d5f90edde6a82c9dde0811211409c) Thanks [@jonathansick](https://github.com/jonathansick)! - Migrate Settings UI pages to App Router with TanStack Query

  **Migrated pages:**

  - `/settings` - Account overview with MDX content
  - `/settings/tokens` - Access token list with create button
  - `/settings/tokens/new` - Create new access token form
  - `/settings/tokens/[id]` - Token detail view
  - `/settings/tokens/history` - Token change history with pagination
  - `/settings/sessions` - Active sessions list
  - `/settings/sessions/[id]` - Session detail view
  - `/settings/sessions/history` - Session history with pagination
  - `/settings/quotas` - Resource quotas display

  **New components:**

  - `AuthRequired` - Reusable client component for auth-protected pages with login redirect
  - `SettingsLayoutClient` - App Router settings layout with sidebar navigation

- [#373](https://github.com/lsst-sqre/squareone/pull/373) [`454db1b`](https://github.com/lsst-sqre/squareone/commit/454db1b4cd68ef1df315e073365f5d8da9e530f6) Thanks [@jonathansick](https://github.com/jonathansick)! - Migrate Times Square pages to App Router

  All Times Square pages now use Next.js App Router instead of Pages Router:

  - `/times-square` - Home page with GitHub repository listing
  - `/times-square/github/[...tsSlug]` - GitHub notebook viewer
  - `/times-square/github-pr/[owner]/[repo]/[commit]` - PR preview landing page
  - `/times-square/github-pr/[owner]/[repo]/[commit]/[...tsSlug]` - PR notebook viewer

  Key implementation details:

  - **TimesSquareUrlParametersProvider** - Consolidated provider using App Router navigation APIs (`useParams`, `usePathname`, `useSearchParams`); removed separate Pages Router variant
  - **Shared layout** - `layout.tsx` handles service availability checks (404 if Times Square not configured) and wraps all pages with `WideContentLayout`
  - **Client components** - SSE updates handled via `TimesSquareHtmlEventsProvider` in client component wrappers
  - **Config access** - Migrated from `useAppConfig` to `useStaticConfig` which works with both routers
  - **TimesSquareParametersClient** - Updated to use `next/navigation` hooks instead of `next/router`

  This completes the Times Square App Router migration as part of the broader squareone modernization effort.

- [#373](https://github.com/lsst-sqre/squareone/pull/373) [`771eb09`](https://github.com/lsst-sqre/squareone/commit/771eb096cff7624f9ed38acd8f26263e46da15b3) Thanks [@jonathansick](https://github.com/jonathansick)! - Migrate Times Square hooks from SWR to TanStack Query

  All Times Square components now use hooks from `@lsst-sqre/times-square-client` instead of local SWR-based implementations:

  - `TimesSquareParametersClient` - uses `useTimesSquarePage` for parameter metadata
  - `TimesSquareGitHubPagePanelClient` - uses `useTimesSquarePage` for page info
  - `TimesSquareHtmlEventsProviderClient` - uses `useTimesSquarePage` for events URL
  - `TimesSquareNotebookViewerClient` - uses `useTimesSquarePage` and `useHtmlStatus` for notebook display
  - `TimesSquareMainGitHubNavClient` - uses `useGitHubContents` for navigation tree
  - `TimesSquarePrGitHubNavClient` - uses `useGitHubPrContents` for PR preview navigation
  - PR Preview Page - uses `useGitHubPrContents` for check status and PR details

  Deleted legacy SWR hooks:

  - `apps/squareone/src/hooks/useTimesSquarePage.ts`
  - `apps/squareone/src/components/TimesSquareNotebookViewer/useHtmlStatus.ts`
  - `apps/squareone/src/components/TimesSquareMainGitHubNav/useGitHubContentsListing.ts`
  - `apps/squareone/src/components/TimesSquarePrGitHubNav/useGitHubPrContentsListing.ts`

### Patch Changes

- [#361](https://github.com/lsst-sqre/squareone/pull/361) [`3914272`](https://github.com/lsst-sqre/squareone/commit/39142723cc43696f25f887f428ae3c84d9a9fefc) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @biomejs/biome from 2.3.8 to 2.3.12

- [#394](https://github.com/lsst-sqre/squareone/pull/394) [`67ebfe8`](https://github.com/lsst-sqre/squareone/commit/67ebfe85aa14b073f611d8792ae302d6615ab72e) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @isaacs/brace-expansion from 5.0.0 to 5.0.1 in the security-patch group across 0 directory

- [#345](https://github.com/lsst-sqre/squareone/pull/345) [`df80f21`](https://github.com/lsst-sqre/squareone/commit/df80f21c4c540d96f0d208155b9ec7c1b06607b1) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @sentry/nextjs from 10.27.0 to 10.35.0 in the runtime group

- [#344](https://github.com/lsst-sqre/squareone/pull/344) [`a9c0c82`](https://github.com/lsst-sqre/squareone/commit/a9c0c8264ea25f0f5e972fa29568d78fa7216af7) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @storybook/addon-a11y from 10.1.4 to 10.2.7

- [#344](https://github.com/lsst-sqre/squareone/pull/344) [`a9c0c82`](https://github.com/lsst-sqre/squareone/commit/a9c0c8264ea25f0f5e972fa29568d78fa7216af7) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @storybook/addon-docs from 10.1.4 to 10.2.7

- [#344](https://github.com/lsst-sqre/squareone/pull/344) [`a9c0c82`](https://github.com/lsst-sqre/squareone/commit/a9c0c8264ea25f0f5e972fa29568d78fa7216af7) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @storybook/addon-links from 10.1.4 to 10.2.7

- [#344](https://github.com/lsst-sqre/squareone/pull/344) [`a9c0c82`](https://github.com/lsst-sqre/squareone/commit/a9c0c8264ea25f0f5e972fa29568d78fa7216af7) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @storybook/addon-onboarding from 10.1.4 to 10.2.7

- [#344](https://github.com/lsst-sqre/squareone/pull/344) [`a9c0c82`](https://github.com/lsst-sqre/squareone/commit/a9c0c8264ea25f0f5e972fa29568d78fa7216af7) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @storybook/addon-themes from 10.1.4 to 10.2.7

- [#344](https://github.com/lsst-sqre/squareone/pull/344) [`a9c0c82`](https://github.com/lsst-sqre/squareone/commit/a9c0c8264ea25f0f5e972fa29568d78fa7216af7) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @storybook/addon-vitest from 10.1.4 to 10.1.11

- [#359](https://github.com/lsst-sqre/squareone/pull/359) [`f0010d1`](https://github.com/lsst-sqre/squareone/commit/f0010d1473ea2639f1126ca715daaf1544a518af) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @storybook/nextjs-vite from 10.1.7 to 10.1.11

- [#344](https://github.com/lsst-sqre/squareone/pull/344) [`a9c0c82`](https://github.com/lsst-sqre/squareone/commit/a9c0c8264ea25f0f5e972fa29568d78fa7216af7) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @storybook/react-vite from 10.1.4 to 10.1.11

- [#372](https://github.com/lsst-sqre/squareone/pull/372) [`0a92d04`](https://github.com/lsst-sqre/squareone/commit/0a92d04973ad4428b13244118be373a903e16230) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @tanstack/react-query from 5.90.12 to 5.90.19 in the misc group

- [#361](https://github.com/lsst-sqre/squareone/pull/361) [`3914272`](https://github.com/lsst-sqre/squareone/commit/39142723cc43696f25f887f428ae3c84d9a9fefc) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @testing-library/react from 16.3.0 to 16.3.2

- [#362](https://github.com/lsst-sqre/squareone/pull/362) [`b9c6ec6`](https://github.com/lsst-sqre/squareone/commit/b9c6ec6123d92ee9f51c3e8db8d24674c5a70168) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @turbo/gen from 2.6.3 to 2.8.3

- [#361](https://github.com/lsst-sqre/squareone/pull/361) [`3914272`](https://github.com/lsst-sqre/squareone/commit/39142723cc43696f25f887f428ae3c84d9a9fefc) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @types/node from 22.19.1 to 22.19.7 in the dev group

- [#365](https://github.com/lsst-sqre/squareone/pull/365) [`58052ea`](https://github.com/lsst-sqre/squareone/commit/58052eabaed4393a0d36c047a01ca8fb84706799) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @types/react from 19.2.7 to 19.2.13 in the react group

- [#361](https://github.com/lsst-sqre/squareone/pull/361) [`3914272`](https://github.com/lsst-sqre/squareone/commit/39142723cc43696f25f887f428ae3c84d9a9fefc) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @vitejs/plugin-react from 5.1.1 to 5.1.2

- [#354](https://github.com/lsst-sqre/squareone/pull/354) [`2d91039`](https://github.com/lsst-sqre/squareone/commit/2d910391d908c9c573969c9246965a82debe9a49) Thanks [@jonathansick](https://github.com/jonathansick)! - Add App Router error boundaries

  Added error handling for the App Router migration:

  - `error.tsx`: Catches errors in route segments and displays a recovery UI
  - `global-error.tsx`: Root-level error boundary for errors in the layout itself

  Both integrate with the existing design system and provide user-friendly error recovery options.

- [#385](https://github.com/lsst-sqre/squareone/pull/385) [`b2ab600`](https://github.com/lsst-sqre/squareone/commit/b2ab6001c0a1fb04f749ea0591c20833568e0b4e) Thanks [@jonathansick](https://github.com/jonathansick)! - Add optional structured logger injection to client packages

  - Added a `Logger` type to each client package (`repertoire-client`, `semaphore-client`, `gafaelfawr-client`, `times-square-client`) matching pino's `(obj, msg)` calling convention
  - All `console.log`, `console.error`, and `console.warn` calls replaced with structured logger calls using `debug`, `error`, and `warn` levels
  - Logger is accepted as an optional parameter; when omitted, a console-based default preserves existing behavior for client-side and test usage
  - squareone's server-side layout now passes its pino logger to `discoveryQueryOptions`, `fetchServiceDiscovery`, and `broadcastsQueryOptions` for structured JSON output on GKE

- [#343](https://github.com/lsst-sqre/squareone/pull/343) [`73cd26e`](https://github.com/lsst-sqre/squareone/commit/73cd26e183caa8f5d51270c0c4f1ca50f32391b1) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump eslint-config-next from 15.5.7 to 15.5.12

- [#362](https://github.com/lsst-sqre/squareone/pull/362) [`b9c6ec6`](https://github.com/lsst-sqre/squareone/commit/b9c6ec6123d92ee9f51c3e8db8d24674c5a70168) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump eslint-config-turbo from 2.6.3 to 2.8.3

- [#386](https://github.com/lsst-sqre/squareone/pull/386) [`dd3a96b`](https://github.com/lsst-sqre/squareone/commit/dd3a96b5eaa205db856f2591f94547b88cbcb006) Thanks [@dependabot](https://github.com/apps/dependabot)! - Migrate ESLint configuration to v9 flat config format

  - Replace legacy `.eslintrc.js` files with `eslint.config.mjs` across all packages and apps
  - Convert shared `@lsst-sqre/eslint-config` to export a flat config array using `eslint-config-turbo/flat` and `FlatCompat` for `eslint-config-next`
  - Add `@eslint/eslintrc` dependency for FlatCompat bridging where native flat config is not yet available
  - Remove inline `eslintConfig` from squareone's `package.json` in favor of a standalone `eslint.config.mjs`
  - Add explicit `lint` script to squareone

- [#344](https://github.com/lsst-sqre/squareone/pull/344) [`a9c0c82`](https://github.com/lsst-sqre/squareone/commit/a9c0c8264ea25f0f5e972fa29568d78fa7216af7) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump eslint-plugin-storybook from 10.1.4 to 10.1.11

- [#386](https://github.com/lsst-sqre/squareone/pull/386) [`dd3a96b`](https://github.com/lsst-sqre/squareone/commit/dd3a96b5eaa205db856f2591f94547b88cbcb006) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump eslint from 8.57.1 to 9.26.0

- [#385](https://github.com/lsst-sqre/squareone/pull/385) [`713fa38`](https://github.com/lsst-sqre/squareone/commit/713fa386d86a2689b7117d34718546cf9b56e96a) Thanks [@jonathansick](https://github.com/jonathansick)! - Filter internal muster services from API rate limits display

  - Filtered out `muster-` prefixed services from the API Rate Limits section in the quotas settings view, as these are internal services not meaningful to users
  - The Rate Limits section now hides entirely when no user-facing services remain after filtering

- [#382](https://github.com/lsst-sqre/squareone/pull/382) [`5676a89`](https://github.com/lsst-sqre/squareone/commit/5676a89131e09b3944244ad6ee3f45ce1a2f4894) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump lightningcss-cli from 1.30.2 to 1.31.1

- [#382](https://github.com/lsst-sqre/squareone/pull/382) [`5676a89`](https://github.com/lsst-sqre/squareone/commit/5676a89131e09b3944244ad6ee3f45ce1a2f4894) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump lightningcss from 1.30.2 to 1.31.1

- [#378](https://github.com/lsst-sqre/squareone/pull/378) [`3532ade`](https://github.com/lsst-sqre/squareone/commit/3532adeb0e511a2dff2c59838351d55ac498bd8e) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump lodash from 4.17.21 to 4.17.23 in the security-patch group across 1 directory

- [#391](https://github.com/lsst-sqre/squareone/pull/391) [`643b9cb`](https://github.com/lsst-sqre/squareone/commit/643b9cb90c89203bbe57e9562ef3bd2c7825ad56) Thanks [@jonathansick](https://github.com/jonathansick)! - Migrate icons from FontAwesome and react-feather to lucide-react

  **squared package:**

  - Replaced `@fortawesome/fontawesome-svg-core`, `@fortawesome/free-solid-svg-icons`, `@fortawesome/react-fontawesome`, and `react-feather` with `lucide-react` as the unified icon library
  - Updated all components (IconPill, Button, ClipboardButton, DateTimePicker, Modal, Select) to use Lucide icon components
  - Fixed IconPill icon vertical alignment by replacing `font-size: 0.9em` with `vertical-align: text-bottom` for proper SVG baseline alignment
  - Updated component prop types from FontAwesome `[IconPrefix, IconName]` tuples to `LucideIcon` component references
  - Updated Storybook stories and tests to use Lucide icons

  **squareone app:**

  - Migrated all components from FontAwesome and react-feather imports to lucide-react
  - Removed FontAwesome library initialization (`styles/icons.ts`) and CSS import from root layout
  - Removed `react-feather` type declarations
  - Added a custom `GitHubIcon` SVG component for the GitHub logo (not available in lucide-react)
  - Updated icon CSS from `font-size`/`margin-right` patterns to `width`/`height`/flexbox for proper SVG alignment
  - Removed FontAwesome mock from test setup

- [#385](https://github.com/lsst-sqre/squareone/pull/385) [`d259248`](https://github.com/lsst-sqre/squareone/commit/d2592488e603d376bcd35feb73d3b6da4b940b63) Thanks [@jonathansick](https://github.com/jonathansick)! - Migrate mock API routes from Pages Router to App Router

  Migrated all 12 development mock API routes from Pages Router (`pages/api/dev/`) to App Router Route Handlers (`src/app/api/dev/`):

  - Authentication routes: `user-info`, `login`, `logout`
  - Times Square pages routes: page list, page metadata, HTML content, HTML status, and SSE events
  - Times Square GitHub routes: directory tree and slug-based page lookup
  - Times Square GitHub PR routes: PR metadata and PR page preview

  Key changes:

  - Replaced `NextApiRequest`/`NextApiResponse` with Web API `Request`/`Response` and `NextResponse`
  - Converted SSE streaming from Node.js `res.write()` to Web Streams API (`ReadableStream`)
  - Dynamic route params now use `Promise`-based access (Next.js 15+ pattern)
  - Deleted the `src/pages/api/dev/` directory entirely

- [#364](https://github.com/lsst-sqre/squareone/pull/364) [`7c7123a`](https://github.com/lsst-sqre/squareone/commit/7c7123afda56a5fb6256e224a6ab3300883ca6e6) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump msw from 2.12.4 to 2.12.7

- [#341](https://github.com/lsst-sqre/squareone/pull/341) [`dda7c4b`](https://github.com/lsst-sqre/squareone/commit/dda7c4b018b70f842757f6a77200f0689661ea81) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump next from 15.5.7 to 15.5.12

- [#396](https://github.com/lsst-sqre/squareone/pull/396) [`cf7bd89`](https://github.com/lsst-sqre/squareone/commit/cf7bd893f75ecef804e15c72c4e052c9f206e9a1) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump playwright from 1.57.0 to 1.58.1 in the playwright group

- [#385](https://github.com/lsst-sqre/squareone/pull/385) [`a713c75`](https://github.com/lsst-sqre/squareone/commit/a713c75b11ea5e51b1a60c81e21f75932771dc6f) Thanks [@jonathansick](https://github.com/jonathansick)! - Post-migration cleanup: remove SWR, migrate next/router references

  - Removed `swr` dependency (fully replaced by TanStack Query)
  - Migrated all `next/router` references to `next/navigation` in test setup, `TokenHistoryView` tests, and `NewTokenPage` Storybook story
  - Updated Storybook story parameters from Pages Router `router`/`query` format to App Router `navigation`/`searchParams` format
  - Updated `CLAUDE.md` and `.github/copilot-instructions.md` to reflect App Router-only architecture, RSC config patterns, and TanStack Query

- [#345](https://github.com/lsst-sqre/squareone/pull/345) [`df80f21`](https://github.com/lsst-sqre/squareone/commit/df80f21c4c540d96f0d208155b9ec7c1b06607b1) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump react-day-picker from 9.11.2 to 9.13.0

- [#342](https://github.com/lsst-sqre/squareone/pull/342) [`4c8991c`](https://github.com/lsst-sqre/squareone/commit/4c8991ce4a614e8a07a816a3e7024f65a549eb40) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump react-dom from 19.2.1 to 19.2.4

- [#345](https://github.com/lsst-sqre/squareone/pull/345) [`df80f21`](https://github.com/lsst-sqre/squareone/commit/df80f21c4c540d96f0d208155b9ec7c1b06607b1) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump react-hook-form from 7.66.1 to 7.71.1

- [#342](https://github.com/lsst-sqre/squareone/pull/342) [`4c8991c`](https://github.com/lsst-sqre/squareone/commit/4c8991ce4a614e8a07a816a3e7024f65a549eb40) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump react from 19.2.1 to 19.2.4

- [#336](https://github.com/lsst-sqre/squareone/pull/336) [`bf8e71a`](https://github.com/lsst-sqre/squareone/commit/bf8e71a27eb92749dd59ccccd494a5e3993788ff) Thanks [@copilot-swe-agent](https://github.com/apps/copilot-swe-agent)! - Add TypeScript interfaces for Sentry configuration type safety. Introduces a shared `SentryConfig` interface in the config loader and uses it in `_document.tsx` to replace `any` types, improving type safety and removing biome-ignore lint suppressions.

- [#344](https://github.com/lsst-sqre/squareone/pull/344) [`a9c0c82`](https://github.com/lsst-sqre/squareone/commit/a9c0c8264ea25f0f5e972fa29568d78fa7216af7) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump storybook from 10.1.4 to 10.1.11

- [#345](https://github.com/lsst-sqre/squareone/pull/345) [`df80f21`](https://github.com/lsst-sqre/squareone/commit/df80f21c4c540d96f0d208155b9ec7c1b06607b1) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump swr from 2.3.6 to 2.3.8

- [#362](https://github.com/lsst-sqre/squareone/pull/362) [`b9c6ec6`](https://github.com/lsst-sqre/squareone/commit/b9c6ec6123d92ee9f51c3e8db8d24674c5a70168) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump turbo from 2.6.3 to 2.8.3

- [#361](https://github.com/lsst-sqre/squareone/pull/361) [`3914272`](https://github.com/lsst-sqre/squareone/commit/39142723cc43696f25f887f428ae3c84d9a9fefc) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump yaml from 2.8.1 to 2.8.2

- Updated dependencies [[`0a774e8`](https://github.com/lsst-sqre/squareone/commit/0a774e80f3529d1edd845144b853caecc3864743), [`b2ab600`](https://github.com/lsst-sqre/squareone/commit/b2ab6001c0a1fb04f749ea0591c20833568e0b4e), [`dd3a96b`](https://github.com/lsst-sqre/squareone/commit/dd3a96b5eaa205db856f2591f94547b88cbcb006), [`65ba6a5`](https://github.com/lsst-sqre/squareone/commit/65ba6a562d9fced7bce8a9f9074c1f3919af9e38), [`643b9cb`](https://github.com/lsst-sqre/squareone/commit/643b9cb90c89203bbe57e9562ef3bd2c7825ad56), [`8d837f6`](https://github.com/lsst-sqre/squareone/commit/8d837f68b671f2f4ecafd41cc3d97ab4958c0baa), [`49e148f`](https://github.com/lsst-sqre/squareone/commit/49e148f8e301664e18ac44b78531bd738b559dc8), [`5d29200`](https://github.com/lsst-sqre/squareone/commit/5d292008607c9ba4fcb72da79b8427227cb471e0), [`5dba6a8`](https://github.com/lsst-sqre/squareone/commit/5dba6a88de1bba974ef796b0b8a5c3cc65803867)]:
  - @lsst-sqre/semaphore-client@0.2.0
  - @lsst-sqre/repertoire-client@0.2.0
  - @lsst-sqre/gafaelfawr-client@1.0.0
  - @lsst-sqre/times-square-client@1.0.0
  - @lsst-sqre/squared@0.13.0

## 0.30.0

### Minor Changes

- [#323](https://github.com/lsst-sqre/squareone/pull/323) [`e033943`](https://github.com/lsst-sqre/squareone/commit/e033943623ef1e0f6fc0171f16f40d819ba3b7a9) Thanks [@jonathansick](https://github.com/jonathansick)! - Migrate BroadcastBanner button to squared Button component

- [#325](https://github.com/lsst-sqre/squareone/pull/325) [`7109e44`](https://github.com/lsst-sqre/squareone/commit/7109e444364f0a049fdb231da517970958ceb401) Thanks [@jonathansick](https://github.com/jonathansick)! - Add Card, CardGroup, and Note components to squared package

  New components for documentation and content display:

  - **Card**: A content card with shadow and hover border when wrapped in links. Uses CSS Modules with design tokens.
  - **CardGroup**: A responsive CSS Grid container for Card components with configurable `minCardWidth` and `gap` props.
  - **Note**: A callout/note container with floating badge. Supports four types with distinct colors: `note` (red), `warning` (orange), `tip` (green), and `info` (blue).

  The squareone docs page now imports these components from squared instead of using local styled-components implementations. This is part of the ongoing styled-components to CSS Modules migration.

- [#331](https://github.com/lsst-sqre/squareone/pull/331) [`b71c274`](https://github.com/lsst-sqre/squareone/commit/b71c2747282ace95872b71edde87c75be17d47a3) Thanks [@jonathansick](https://github.com/jonathansick)! - Migrate static page components from styled-components to CSS Modules

  This change converts the following component groups to CSS Modules styling:

  **Layout Core Components**

  - `Page` - Main page wrapper component
  - `MainContent` - Content area wrapper
  - `WideContentLayout` - Full-width content layout

  **Header Components**

  - `Header` - Main site header
  - `HeaderNav` - Navigation links in header
  - `PreHeader` - Above-header section
  - `Login` - User login/logout controls

  **Footer Components**

  - `Footer` - Main site footer
  - `FooterComponents` - Footer sub-components (social links, copyright)

  **Sidebar Components**

  - `Sidebar` - Sidebar container
  - `SidebarLayout` - Layout with sidebar
  - `SidebarNavItem` - Individual navigation items
  - `SidebarNavSection` - Navigation section groupings
  - `MobileMenuToggle` - Mobile menu hamburger button

  **Homepage Components**

  - `HomepageHero` - Landing page hero section
  - `FullBleedBackgroundImageSection` - Full-width background image sections

  **Typography Components**

  - `Typography` - Text styling components

  **Static Page Components**

  - `Section` - Content section component used in docs and support pages

  This migration moves the squareone app closer to eliminating styled-components in favor of CSS Modules with design tokens, improving consistency with the squared component library architecture.

- [#332](https://github.com/lsst-sqre/squareone/pull/332) [`d61c458`](https://github.com/lsst-sqre/squareone/commit/d61c45840fdfd28d7ab27818e7f16bdab70898dc) Thanks [@jonathansick](https://github.com/jonathansick)! - Migrate Times Square components from styled-components to CSS Modules

  This change completes the CSS Modules migration for all Times Square notebook execution components, replacing styled-components with CSS Modules and design tokens.

  **Times Square App Layout**

  - `TimesSquareApp` - Main app layout wrapper
  - `Sidebar` - Times Square sidebar with navigation

  **GitHub Navigation Components**

  - `TimesSquareGitHubNav` - File tree navigation
  - `Directory` - Directory entries with expandable folders
  - `Page` - Notebook page entries with current state highlighting
  - `TimesSquareMainGitHubNavClient` - Main branch navigation container
  - `TimesSquarePrGitHubNavClient` - PR preview navigation container

  **GitHub PR Badge Components**

  - `GitHubPrBadge` - PR state badges with dynamic colors
  - `GitHubPrTitle` - PR header with title and subtitle
  - `GitHubCheckBadge` - CI check status badges

  **Notebook Viewer Components**

  - `TimesSquareNotebookViewerClient` - Notebook iframe viewer
  - `ParameterInput` - Form input wrapper with labels
  - `StringInput` - Text input with error state styling
  - `TimesSquareParametersClient` - Parameter form container

  **Page Panel Components**

  - `TimesSquareGitHubPagePanel` - Page info container
  - `TimesSquareGitHubPagePanelClient` - Client-side page panel
  - `ExecStats` - Execution statistics and recompute button
  - `GitHubEditLink` - Link to edit notebook on GitHub
  - `IpynbDownloadLink` - Notebook download link

  **Page Files**

  - GitHub PR landing page (`[commit].tsx`)

  **Button Migration**

  Replaced the custom `Button` component with `@lsst-sqre/squared` Button component, using appropriate variants (`appearance="outline"`, `tone="danger"`, `size="sm"`). The old `Button/` component directory has been deleted.

  **Dynamic Styling Patterns**

  - Uses `clsx` for conditional classes (current page highlighting, error states)
  - Uses CSS custom properties for dynamic colors (PR state colors)
  - Uses inline styles for computed color values (check badge colors)

### Patch Changes

- [#329](https://github.com/lsst-sqre/squareone/pull/329) [`8f01ffc`](https://github.com/lsst-sqre/squareone/commit/8f01ffc2ce706d37dc8e54fc6bee0e2b4393d7a1) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @storybook/addon-a11y from 10.0.8 to 10.1.3

- [#329](https://github.com/lsst-sqre/squareone/pull/329) [`8f01ffc`](https://github.com/lsst-sqre/squareone/commit/8f01ffc2ce706d37dc8e54fc6bee0e2b4393d7a1) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @storybook/addon-docs from 10.0.8 to 10.1.3

- [#329](https://github.com/lsst-sqre/squareone/pull/329) [`8f01ffc`](https://github.com/lsst-sqre/squareone/commit/8f01ffc2ce706d37dc8e54fc6bee0e2b4393d7a1) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @storybook/addon-links from 10.0.8 to 10.1.3

- [#329](https://github.com/lsst-sqre/squareone/pull/329) [`8f01ffc`](https://github.com/lsst-sqre/squareone/commit/8f01ffc2ce706d37dc8e54fc6bee0e2b4393d7a1) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @storybook/addon-onboarding from 10.0.8 to 10.1.3

- [#329](https://github.com/lsst-sqre/squareone/pull/329) [`8f01ffc`](https://github.com/lsst-sqre/squareone/commit/8f01ffc2ce706d37dc8e54fc6bee0e2b4393d7a1) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @storybook/addon-themes from 10.0.8 to 10.1.3

- [#329](https://github.com/lsst-sqre/squareone/pull/329) [`8f01ffc`](https://github.com/lsst-sqre/squareone/commit/8f01ffc2ce706d37dc8e54fc6bee0e2b4393d7a1) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @storybook/addon-vitest from 10.0.8 to 10.1.3

- [#330](https://github.com/lsst-sqre/squareone/pull/330) [`2a03f41`](https://github.com/lsst-sqre/squareone/commit/2a03f41ac06781be85dcd304b0107333dc8f17c1) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @turbo/gen from 2.6.1 to 2.6.3

- [#339](https://github.com/lsst-sqre/squareone/pull/339) [`827d024`](https://github.com/lsst-sqre/squareone/commit/827d024ad17de517381851440365d1d0126f6fdc) Thanks [@jonathansick](https://github.com/jonathansick)! - Fix API rate limit time window description

  Updated the rate limit description in QuotasView to correctly state that API rate limits are measured over a 60 second window (reset every minute) instead of the previous incorrect 15 minute window description.

- [#323](https://github.com/lsst-sqre/squareone/pull/323) [`f767cf1`](https://github.com/lsst-sqre/squareone/commit/f767cf1d622d7800419fa0ebe0fbf56cea4c1182) Thanks [@jonathansick](https://github.com/jonathansick)! - Fix BroadcastBanner button baseline alignment

- [#328](https://github.com/lsst-sqre/squareone/pull/328) [`8001bac`](https://github.com/lsst-sqre/squareone/commit/8001bacaa33b308e07536e9992db29c551f392a7) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump eslint-config-next from 15.5.6 to 15.5.7 in the nextjs group

- [#330](https://github.com/lsst-sqre/squareone/pull/330) [`2a03f41`](https://github.com/lsst-sqre/squareone/commit/2a03f41ac06781be85dcd304b0107333dc8f17c1) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump eslint-config-turbo from 2.6.1 to 2.6.3

- [#334](https://github.com/lsst-sqre/squareone/pull/334) [`3fc5955`](https://github.com/lsst-sqre/squareone/commit/3fc59553ee9907512e76cffc047a1acffdc05637) Thanks [@jonathansick](https://github.com/jonathansick)! - Migrate from next/legacy/image to next/image

  Upgraded the remaining Image components from the legacy `next/legacy/image` import to the modern `next/image` component. This is part of the Next.js 15 upgrade to remove deprecated APIs.

  **Components updated:**

  - `PreHeader` - Header logo image
  - `Footer` - Agency partner logos
  - `FooterComponents` - PartnerLogos MDX component

  **Changes:**

  - Replaced `import Image from 'next/legacy/image'` with `import Image from 'next/image'`
  - Added responsive styling with `style={{ maxWidth: '100%', width: 'auto', height: 'auto' }}` to maintain aspect ratios
  - Both `width` and `height` set to `'auto'` to satisfy Next.js 13+ Image component requirements

  The SidebarLayout component had minor whitespace cleanup.

- [#334](https://github.com/lsst-sqre/squareone/pull/334) [`611bf95`](https://github.com/lsst-sqre/squareone/commit/611bf95b36bed119cc15ac7a0c20fdf6557a3337) Thanks [@jonathansick](https://github.com/jonathansick)! - Migrate to modern next/Link behavior

  Removed the `legacyBehavior` prop from Next.js Link components across the application. This is part of the Next.js 15 upgrade to use the modern Link API.

  **Components updated:**

  - `HeaderNav` - Internal navigation trigger links
  - `TimesSquareGitHubNav/Page` - Page links in the GitHub navigation sidebar

  **Changes:**

  - Removed `legacyBehavior` and `passHref` props from Link components
  - Updated `InternalTriggerLink` to use `PrimaryNavigation.TriggerLink` with `asChild` pattern, passing the `active` state to support active link styling

- [#321](https://github.com/lsst-sqre/squareone/pull/321) [`24c8c39`](https://github.com/lsst-sqre/squareone/commit/24c8c39195c9c8726ca3564535a4eddbdcf6f688) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump next from 15.5.6 to 15.5.7

- [#327](https://github.com/lsst-sqre/squareone/pull/327) [`2cd11b4`](https://github.com/lsst-sqre/squareone/commit/2cd11b4c1486a5140384ed727bb27d06f5a5fc41) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump react-dom from 19.2.0 to 19.2.1

- [#327](https://github.com/lsst-sqre/squareone/pull/327) [`2cd11b4`](https://github.com/lsst-sqre/squareone/commit/2cd11b4c1486a5140384ed727bb27d06f5a5fc41) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump react from 19.2.0 to 19.2.1

- [#333](https://github.com/lsst-sqre/squareone/pull/333) [`b603d1e`](https://github.com/lsst-sqre/squareone/commit/b603d1e8030dda45ce38b522261c392bbcd788ba) Thanks [@jonathansick](https://github.com/jonathansick)! - Remove deprecated amp config inherited from defaultConfig

  The Next.js config was spreading `defaultConfig` which included the deprecated `amp` configuration option. This caused deprecation warnings during builds. The fix removes the unnecessary `defaultConfig` spread since Next.js applies sensible defaults automatically, and we only need to specify our custom configuration options.

- [#335](https://github.com/lsst-sqre/squareone/pull/335) [`6085ca2`](https://github.com/lsst-sqre/squareone/commit/6085ca20d97f32c5cb42df346501d89116b3eb5c) Thanks [@jonathansick](https://github.com/jonathansick)! - Remove styled-components dependency from squareone

  This completes the CSS Modules migration by removing all styled-components configuration, dependencies, and documentation references from the monorepo.

  **Code Changes**

  - Remove `ServerStyleSheet` SSR configuration from `_document.tsx` (Sentry config injection retained)
  - Remove `styledComponents: true` compiler option from `next.config.js`
  - Remove styled-components module declaration from `src/types/index.d.ts`
  - Remove `styled-components` and `@types/styled-components` dependencies from package.json

  **Documentation Updates**

  - Update CLAUDE.md, README.md, and `.github/copilot-instructions.md` to reflect CSS Modules as the standard styling approach
  - Remove styled-components RST reference from docs epilog

  **Development Tooling**

  - Remove styled-components VS Code extension from `.devcontainer/devcontainer.json`
  - Update Storybook decorator comment (GlobalStyles is CSS-based, not styled-components)

  All styling in both the squared package and squareone app now uses CSS Modules.

- [#330](https://github.com/lsst-sqre/squareone/pull/330) [`2a03f41`](https://github.com/lsst-sqre/squareone/commit/2a03f41ac06781be85dcd304b0107333dc8f17c1) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump turbo from 2.6.1 to 2.6.3

- Updated dependencies [[`2bb920e`](https://github.com/lsst-sqre/squareone/commit/2bb920e5408659f061490d306d36770686debe3c), [`7109e44`](https://github.com/lsst-sqre/squareone/commit/7109e444364f0a049fdb231da517970958ceb401), [`611bf95`](https://github.com/lsst-sqre/squareone/commit/611bf95b36bed119cc15ac7a0c20fdf6557a3337)]:
  - @lsst-sqre/squared@0.12.0

## 0.29.0

### Minor Changes

- [#302](https://github.com/lsst-sqre/squareone/pull/302) [`f2a2796`](https://github.com/lsst-sqre/squareone/commit/f2a27965161c3c2bd22aaed7cb278ed767f6bfdb) Thanks [@jonathansick](https://github.com/jonathansick)! - Add MDX-configurable footer

  The page footer can now be customized using MDX content. This enables deployments to customize footer content (contact information, legal notices, institutional links) without code changes. The new `footerMdxPath` configuration sets the path to the footer MDX file relative to `mdxDir` (defaults to `footer.mdx`).

- [#302](https://github.com/lsst-sqre/squareone/pull/302) [`8fa6d87`](https://github.com/lsst-sqre/squareone/commit/8fa6d8704269c1c8e1bae6a046f1b253d46d0b56) Thanks [@jonathansick](https://github.com/jonathansick)! - Add runtime-configurable header logo

  The header logo can now be customized at runtime through the AppConfig system, enabling per-deployment branding without code changes. The custom header can be an external image URL (`headerLogoUrl` configuration), or embedded base64-encoded image data (`headerLogoData` + `headerLogoMimeType` configurations). When using custom logos, `headerLogoWidth` and `headerLogoHeight` must be provided to ensure correct display dimensions.

### Patch Changes

- [#311](https://github.com/lsst-sqre/squareone/pull/311) [`4384760`](https://github.com/lsst-sqre/squareone/commit/4384760b584f9ce0016be80b135e2d3bf5a0c85a) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @biomejs/biome from 2.3.5 to 2.3.8 in the dev group

- [#319](https://github.com/lsst-sqre/squareone/pull/319) [`23add82`](https://github.com/lsst-sqre/squareone/commit/23add826a9d67f5ba76fa3137a5090454f92c057) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @changesets/changelog-github from 0.5.1 to 0.5.2

- [#319](https://github.com/lsst-sqre/squareone/pull/319) [`23add82`](https://github.com/lsst-sqre/squareone/commit/23add826a9d67f5ba76fa3137a5090454f92c057) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @changesets/cli from 2.29.7 to 2.29.8

- [#310](https://github.com/lsst-sqre/squareone/pull/310) [`eb581d8`](https://github.com/lsst-sqre/squareone/commit/eb581d896045b19938c8a4c74f10ef2e8887e78b) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @sentry/nextjs from 10.25.0 to 10.26.0 in the sentry group

- [#314](https://github.com/lsst-sqre/squareone/pull/314) [`cb29422`](https://github.com/lsst-sqre/squareone/commit/cb2942217317a43905b53d3bcb4b7eda3a81a1b2) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @sentry/node from 10.26.0 to 10.27.0 in the security-patch group across 0 directory

- [#306](https://github.com/lsst-sqre/squareone/pull/306) [`c2dfea7`](https://github.com/lsst-sqre/squareone/commit/c2dfea714e28f724daa72f83aaaf19f8ac2094b0) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @storybook/addon-a11y from 10.0.7 to 10.0.8

- [#306](https://github.com/lsst-sqre/squareone/pull/306) [`c2dfea7`](https://github.com/lsst-sqre/squareone/commit/c2dfea714e28f724daa72f83aaaf19f8ac2094b0) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @storybook/addon-docs from 10.0.7 to 10.0.8

- [#306](https://github.com/lsst-sqre/squareone/pull/306) [`c2dfea7`](https://github.com/lsst-sqre/squareone/commit/c2dfea714e28f724daa72f83aaaf19f8ac2094b0) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @storybook/addon-links from 10.0.7 to 10.0.8

- [#306](https://github.com/lsst-sqre/squareone/pull/306) [`c2dfea7`](https://github.com/lsst-sqre/squareone/commit/c2dfea714e28f724daa72f83aaaf19f8ac2094b0) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @storybook/addon-onboarding from 10.0.7 to 10.0.8

- [#306](https://github.com/lsst-sqre/squareone/pull/306) [`c2dfea7`](https://github.com/lsst-sqre/squareone/commit/c2dfea714e28f724daa72f83aaaf19f8ac2094b0) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @storybook/addon-themes from 10.0.7 to 10.0.8

- [#306](https://github.com/lsst-sqre/squareone/pull/306) [`c2dfea7`](https://github.com/lsst-sqre/squareone/commit/c2dfea714e28f724daa72f83aaaf19f8ac2094b0) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @storybook/addon-vitest from 10.0.7 to 10.0.8

- [#306](https://github.com/lsst-sqre/squareone/pull/306) [`c2dfea7`](https://github.com/lsst-sqre/squareone/commit/c2dfea714e28f724daa72f83aaaf19f8ac2094b0) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @storybook/nextjs-vite from 10.0.7 to 10.0.8

- [#306](https://github.com/lsst-sqre/squareone/pull/306) [`c2dfea7`](https://github.com/lsst-sqre/squareone/commit/c2dfea714e28f724daa72f83aaaf19f8ac2094b0) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @storybook/react-vite from 10.0.7 to 10.0.8

- [#303](https://github.com/lsst-sqre/squareone/pull/303) [`e7230dd`](https://github.com/lsst-sqre/squareone/commit/e7230dde9790122f6a183065b5b62d678ecab58a) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @types/react from 19.2.3 to 19.2.7 in the react group

- [#308](https://github.com/lsst-sqre/squareone/pull/308) [`a25b28b`](https://github.com/lsst-sqre/squareone/commit/a25b28b53676bc55a2650dcafa3daa97aeb01df0) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @types/styled-components from 5.1.35 to 5.1.36 in the styling group

- [#309](https://github.com/lsst-sqre/squareone/pull/309) [`b93f4fb`](https://github.com/lsst-sqre/squareone/commit/b93f4fbb9115f01e356b312e8e8572c2c18faf6f) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @vitejs/plugin-react from 5.1.0 to 5.1.1 in the build-tools group

- [#316](https://github.com/lsst-sqre/squareone/pull/316) [`ff41341`](https://github.com/lsst-sqre/squareone/commit/ff41341ad32efa624b2d5b1829181a583512db49) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump actions/checkout from 5 to 6

- [#306](https://github.com/lsst-sqre/squareone/pull/306) [`c2dfea7`](https://github.com/lsst-sqre/squareone/commit/c2dfea714e28f724daa72f83aaaf19f8ac2094b0) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump eslint-plugin-storybook from 10.0.7 to 10.0.8

- [#305](https://github.com/lsst-sqre/squareone/pull/305) [`0dc1a75`](https://github.com/lsst-sqre/squareone/commit/0dc1a75c72f15fe1584f695f59aad650df9c2036) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump glob from 12.0.0 to 13.0.0

- [#316](https://github.com/lsst-sqre/squareone/pull/316) [`ff41341`](https://github.com/lsst-sqre/squareone/commit/ff41341ad32efa624b2d5b1829181a583512db49) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump lsst-sqre/multiplatform-build-and-push/.github/workflows/build.yaml from 2 to 3

- [#312](https://github.com/lsst-sqre/squareone/pull/312) [`9d3b09a`](https://github.com/lsst-sqre/squareone/commit/9d3b09aacc78e6186555449174849f6f6e92f897) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump msw from 2.12.1 to 2.12.3

- [#318](https://github.com/lsst-sqre/squareone/pull/318) [`374e3cc`](https://github.com/lsst-sqre/squareone/commit/374e3ccf1c5964ab1298d948c952edc442f28002) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump playwright from 1.56.1 to 1.57.0 in the playwright group

- [#307](https://github.com/lsst-sqre/squareone/pull/307) [`8b1ab0f`](https://github.com/lsst-sqre/squareone/commit/8b1ab0f0a1735888ca29d719f2511dae1dc0bcaf) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump react-day-picker from 9.11.1 to 9.11.2 in the date-handling group

- [#313](https://github.com/lsst-sqre/squareone/pull/313) [`11304c6`](https://github.com/lsst-sqre/squareone/commit/11304c6d2305ca265a4207a7fed302ec5e9c4119) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump react-hook-form from 7.66.0 to 7.66.1

- [#306](https://github.com/lsst-sqre/squareone/pull/306) [`c2dfea7`](https://github.com/lsst-sqre/squareone/commit/c2dfea714e28f724daa72f83aaaf19f8ac2094b0) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump storybook from 10.0.7 to 10.0.8

## 0.28.5

### Patch Changes

- [#295](https://github.com/lsst-sqre/squareone/pull/295) [`8190c5a`](https://github.com/lsst-sqre/squareone/commit/8190c5af9ac6e9975930923ae71abc8f90eabeae) Thanks [@jonathansick](https://github.com/jonathansick)! - Adopt Biome as primary code formatter

  Replaced Prettier with Biome for formatting JavaScript, TypeScript, JSON, and CSS files. Biome provides faster formatting with better tooling integration while maintaining the same code style. Prettier is retained exclusively for YAML file formatting.

  Key changes:

  - Added Biome configuration matching existing Prettier formatting rules
  - Updated CI workflow to check Biome formatting
  - Configured VSCode to use Biome as the default formatter
  - Updated pre-commit hooks (lint-staged) to run Biome
  - Applied Biome formatting across the entire codebase
  - Cleaned up unused imports exposed by Biome's import organization

  Developer impact:

  - Formatting commands changed: Use `pnpm run biome:format` instead of `pnpm run format`
  - VSCode will now use Biome for auto-formatting JavaScript/TypeScript files
  - YAML files continue to use Prettier formatting
  - package.json files are intentionally excluded from automatic formatting to avoid conflicts with pnpm and dependabot

- [#298](https://github.com/lsst-sqre/squareone/pull/298) [`4f37d09`](https://github.com/lsst-sqre/squareone/commit/4f37d09b5ac6ee258a013d6c44849a35298111ec) Thanks [@jonathansick](https://github.com/jonathansick)! - Add Biome linting alongside ESLint for comprehensive code quality

  Enabled Biome's linting capabilities to complement the existing ESLint setup, creating a hybrid approach that leverages the strengths of both tools.

  **Biome linting features:**

  - Fast, modern linting for JavaScript/TypeScript/JSON/CSS
  - All recommended rule groups enabled (accessibility, complexity, correctness, performance, security, style, suspicious)
  - Severity-based exit behavior: errors block builds, warnings are visible but non-blocking
  - Integrated with the same `biome check` command used for formatting

  **Linting strategy:**

  - Biome provides fast feedback for common issues with auto-fix capabilities
  - ESLint continues to run via Turborepo for comprehensive rule coverage and framework-specific rules
  - Both tools run in CI for thorough code quality validation

  **Code quality improvements:**

  - Resolved 152 Biome linting violations across the codebase
  - Fixed unused variables and unreachable code
  - Replaced `any` types with `unknown` or proper types for better type safety
  - Fixed accessibility issues (ARIA roles, button types, semantic elements)
  - Eliminated unnecessary code fragments and shadowed restricted names
  - Added missing React imports for JSX transform compatibility

  Developer impact:

  - Use `pnpm biome:lint` for fast local linting with auto-fix
  - Use `pnpm lint` for comprehensive ESLint checks via Turborepo
  - Both checks run in CI and `pnpm localci` for pre-push validation
  - VSCode configured to show Biome diagnostics in real-time

- [#298](https://github.com/lsst-sqre/squareone/pull/298) [`4f37d09`](https://github.com/lsst-sqre/squareone/commit/4f37d09b5ac6ee258a013d6c44849a35298111ec) Thanks [@jonathansick](https://github.com/jonathansick)! - Improve CI validation with better tooling and local testing

  Enhanced the GitHub Actions CI workflow and local development validation to catch issues earlier and provide better feedback:

  **New validation tools:**

  - Docker version validation ensures Dockerfile versions match package.json before builds
  - Prettier YAML formatting check catches configuration file formatting issues
  - Biome formatting and linting integrated into CI pipeline

  **localci improvements:**

  - Comprehensive local CI simulation matching production workflow exactly
  - Execution order mirrors CI: Docker validation → formatting → linting → type-check → tests → build
  - Catches all CI issues locally before pushing

  **CI workflow enhancements:**

  - Renamed linting steps for clarity ("ESLint" instead of generic "Lint")
  - Proper Biome severity handling: errors fail builds, warnings are visible but non-blocking
  - Optimized type-check dependencies to enable better parallelization

  Developer impact:

  - Run `pnpm localci` to validate changes exactly as CI will before pushing
  - Earlier detection of Docker version mismatches
  - YAML formatting validation prevents workflow file issues
  - Faster feedback loop with local validation matching CI behavior

- [#299](https://github.com/lsst-sqre/squareone/pull/299) [`62a81bc`](https://github.com/lsst-sqre/squareone/commit/62a81bc54462e2360e17cc8acf58c9c32a9bed2b) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump glob from 11.0.3 to 12.0.0

- [#297](https://github.com/lsst-sqre/squareone/pull/297) [`67085a9`](https://github.com/lsst-sqre/squareone/commit/67085a9ff092996df44a3b5fe66d957e47391cc2) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump js-yaml from 4.1.0 to 4.1.1 in the security-patch group across 1 directory

- [#295](https://github.com/lsst-sqre/squareone/pull/295) [`8190c5a`](https://github.com/lsst-sqre/squareone/commit/8190c5af9ac6e9975930923ae71abc8f90eabeae) Thanks [@jonathansick](https://github.com/jonathansick)! - Automate Playwright browser installation in CI

  Added automatic Playwright browser installation script that runs during CI setup. This eliminates manual browser installation steps and ensures the correct browser versions are always available for testing.

  The installation script detects the CI environment and automatically installs Playwright browsers when needed, improving CI reliability and reducing setup complexity.

- Updated dependencies [[`8190c5a`](https://github.com/lsst-sqre/squareone/commit/8190c5af9ac6e9975930923ae71abc8f90eabeae), [`4f37d09`](https://github.com/lsst-sqre/squareone/commit/4f37d09b5ac6ee258a013d6c44849a35298111ec)]:
  - @lsst-sqre/squared@0.11.1

## 0.28.4

### Patch Changes

- [#259](https://github.com/lsst-sqre/squareone/pull/259) [`ba1633c`](https://github.com/lsst-sqre/squareone/commit/ba1633cccbb8331592fe209c26e9a7e0c4d844ef) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @radix-ui/react-label from 2.1.7 to 2.1.8

- [#259](https://github.com/lsst-sqre/squareone/pull/259) [`ba1633c`](https://github.com/lsst-sqre/squareone/commit/ba1633cccbb8331592fe209c26e9a7e0c4d844ef) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @radix-ui/react-visually-hidden from 1.2.3 to 1.2.4

- [#263](https://github.com/lsst-sqre/squareone/pull/263) [`f0f29ef`](https://github.com/lsst-sqre/squareone/commit/f0f29ef9957b6bbdce7aa3f21c872e3938df39a3) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @sentry/nextjs from 10.8.0 to 10.25.0 in the sentry group

- [#279](https://github.com/lsst-sqre/squareone/pull/279) [`fc4e806`](https://github.com/lsst-sqre/squareone/commit/fc4e806547d421d672e0e78412dc3d4a6bb0b903) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @storybook/addon-a11y from 10.0.6 to 10.0.7

- [#279](https://github.com/lsst-sqre/squareone/pull/279) [`fc4e806`](https://github.com/lsst-sqre/squareone/commit/fc4e806547d421d672e0e78412dc3d4a6bb0b903) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @storybook/addon-docs from 10.0.6 to 10.0.7

- [#279](https://github.com/lsst-sqre/squareone/pull/279) [`fc4e806`](https://github.com/lsst-sqre/squareone/commit/fc4e806547d421d672e0e78412dc3d4a6bb0b903) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @storybook/addon-links from 10.0.6 to 10.0.7

- [#279](https://github.com/lsst-sqre/squareone/pull/279) [`fc4e806`](https://github.com/lsst-sqre/squareone/commit/fc4e806547d421d672e0e78412dc3d4a6bb0b903) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @storybook/addon-onboarding from 10.0.6 to 10.0.7

- [#279](https://github.com/lsst-sqre/squareone/pull/279) [`fc4e806`](https://github.com/lsst-sqre/squareone/commit/fc4e806547d421d672e0e78412dc3d4a6bb0b903) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @storybook/addon-themes from 10.0.6 to 10.0.7

- [#279](https://github.com/lsst-sqre/squareone/pull/279) [`fc4e806`](https://github.com/lsst-sqre/squareone/commit/fc4e806547d421d672e0e78412dc3d4a6bb0b903) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @storybook/addon-vitest from 10.0.6 to 10.0.7

- [#279](https://github.com/lsst-sqre/squareone/pull/279) [`fc4e806`](https://github.com/lsst-sqre/squareone/commit/fc4e806547d421d672e0e78412dc3d4a6bb0b903) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @storybook/nextjs-vite from 10.0.6 to 10.0.7

- [#279](https://github.com/lsst-sqre/squareone/pull/279) [`fc4e806`](https://github.com/lsst-sqre/squareone/commit/fc4e806547d421d672e0e78412dc3d4a6bb0b903) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @storybook/react-vite from 10.0.6 to 10.0.7

- [#255](https://github.com/lsst-sqre/squareone/pull/255) [`5a7c20e`](https://github.com/lsst-sqre/squareone/commit/5a7c20e23172a66bfd06b7d3ffe64d1918763e90) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @testing-library/jest-dom from 6.8.0 to 6.9.1 in the testing-library group

- [#273](https://github.com/lsst-sqre/squareone/pull/273) [`28644d0`](https://github.com/lsst-sqre/squareone/commit/28644d0cbab26003fe1e3a6fe856337f09d7627f) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @turbo/gen from 2.6.0 to 2.6.1

- [#287](https://github.com/lsst-sqre/squareone/pull/287) [`b145d65`](https://github.com/lsst-sqre/squareone/commit/b145d65bb77ee135c6c238f2c977c93c22424086) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @types/node from 24.10.0 to 24.10.1

- [#252](https://github.com/lsst-sqre/squareone/pull/252) [`4fa4584`](https://github.com/lsst-sqre/squareone/commit/4fa45848df9497ef6012b961596684481f2a5445) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @types/react-dom from 19.1.9 to 19.2.3

- [#252](https://github.com/lsst-sqre/squareone/pull/252) [`4fa4584`](https://github.com/lsst-sqre/squareone/commit/4fa45848df9497ef6012b961596684481f2a5445) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @types/react from 19.1.12 to 19.2.3

- [#261](https://github.com/lsst-sqre/squareone/pull/261) [`fe635ef`](https://github.com/lsst-sqre/squareone/commit/fe635ef7a0c09ee3c28374e588717d5d3f0646da) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @types/styled-components from 5.1.34 to 5.1.35 in the styling group

- [#262](https://github.com/lsst-sqre/squareone/pull/262) [`1cff726`](https://github.com/lsst-sqre/squareone/commit/1cff72645e54ab79df0a85b1eef03f2290de5f67) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump @vitejs/plugin-react from 5.0.2 to 5.1.0 in the build-tools group

- [#246](https://github.com/lsst-sqre/squareone/pull/246) [`dc8cc3f`](https://github.com/lsst-sqre/squareone/commit/dc8cc3f57ca666d1523079a0f0bcb5c775a3e3ab) Thanks [@jonathansick](https://github.com/jonathansick)! - Update Node.js from 22.13.0 to 22.21.1

  This infrastructure update brings the latest LTS improvements, bug fixes, and security patches from Node.js 22. Updated in:

  - `.nvmrc` for local development environment
  - `apps/squareone/Dockerfile` for production Docker builds
  - GitHub Actions workflows automatically use the `.nvmrc` version

  Developers should run `nvm use` to switch to the new Node.js version locally.

- [#246](https://github.com/lsst-sqre/squareone/pull/246) [`2af16dd`](https://github.com/lsst-sqre/squareone/commit/2af16dd28503456b304701b22126f53a8718db98) Thanks [@jonathansick](https://github.com/jonathansick)! - Pre-install pnpm in Docker base image to eliminate startup download

  The Dockerfile now uses `corepack prepare pnpm@10.20.0 --activate` in the base stage to download and cache pnpm during the image build. This eliminates the "Corepack is about to download..." message and network request that previously occurred on every container startup.

  This improves container startup time and reliability, especially in environments with restricted network access.

- [#246](https://github.com/lsst-sqre/squareone/pull/246) [`8158829`](https://github.com/lsst-sqre/squareone/commit/8158829cfa67fd27a82fc732e1f192f8cda2a630) Thanks [@jonathansick](https://github.com/jonathansick)! - Use local turbo via pnpm in Dockerfile

  The Dockerfile now uses `pnpm dlx turbo@2.6.0` instead of a globally installed turbo package. This:

  - Removes the `npm install -g turbo` step from the base image
  - Uses the exact turbo version (2.6.0) consistently via pnpm dlx
  - Copies the `scripts/` directory to ensure `turbo-wrapper.js` is available for remote caching
  - Aligns Docker builds with the local development workflow that uses pnpm scripts

  This change makes the Docker build process more consistent with local development and reduces the base image size.

- [#270](https://github.com/lsst-sqre/squareone/pull/270) [`26789ea`](https://github.com/lsst-sqre/squareone/commit/26789eab22b0d0697236a9f085be71df8f2f83a5) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump eslint-config-next from 15.5.2 to 15.5.6

- [#273](https://github.com/lsst-sqre/squareone/pull/273) [`28644d0`](https://github.com/lsst-sqre/squareone/commit/28644d0cbab26003fe1e3a6fe856337f09d7627f) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump eslint-config-turbo from 2.5.6 to 2.6.1

- [#279](https://github.com/lsst-sqre/squareone/pull/279) [`fc4e806`](https://github.com/lsst-sqre/squareone/commit/fc4e806547d421d672e0e78412dc3d4a6bb0b903) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump eslint-plugin-storybook from 10.0.6 to 10.0.7

- [#281](https://github.com/lsst-sqre/squareone/pull/281) [`a79fd1f`](https://github.com/lsst-sqre/squareone/commit/a79fd1f4819a9e53e242f493c5958c43ea31a554) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump formik from 2.4.6 to 2.4.9

- [#260](https://github.com/lsst-sqre/squareone/pull/260) [`3c86dc3`](https://github.com/lsst-sqre/squareone/commit/3c86dc35372aa806c90e47ad324d1fa7bee3ac47) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump lightningcss-cli from 1.30.1 to 1.30.2

- [#260](https://github.com/lsst-sqre/squareone/pull/260) [`3c86dc3`](https://github.com/lsst-sqre/squareone/commit/3c86dc35372aa806c90e47ad324d1fa7bee3ac47) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump lightningcss from 1.30.1 to 1.30.2

- [#265](https://github.com/lsst-sqre/squareone/pull/265) [`02a9457`](https://github.com/lsst-sqre/squareone/commit/02a945743223dbca902d5c4558ce822a18bd3ff1) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump msw from 2.12.0 to 2.12.1

- [#294](https://github.com/lsst-sqre/squareone/pull/294) [`a88c2b0`](https://github.com/lsst-sqre/squareone/commit/a88c2b022f2f02c2de8f32f55e09fdc2b69462bd) Thanks [@jonathansick](https://github.com/jonathansick)! - Enable "next" image tag for changeset release previews

  The CI workflow now builds and pushes Docker images with a special "next" tag when the `changeset-release/main` branch is updated. This allows developers and managers to preview the next version before merging the "Version Packages" PR.

  Previously, the workflow would only build images for the changeset-release branch without pushing them to the registry. Now:

  - Images are pushed to ghcr.io with both the branch-derived tag and the "next" tag
  - The "next" tag can be used to deploy and test the upcoming version in staging environments
  - Other changeset-release branches (non-main) remain build-only

  This improves the release preview workflow by making pre-release images easily accessible via a stable tag name.

- [#270](https://github.com/lsst-sqre/squareone/pull/270) [`26789ea`](https://github.com/lsst-sqre/squareone/commit/26789eab22b0d0697236a9f085be71df8f2f83a5) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump next-plausible from 3.12.4 to 3.12.5

- [#270](https://github.com/lsst-sqre/squareone/pull/270) [`26789ea`](https://github.com/lsst-sqre/squareone/commit/26789eab22b0d0697236a9f085be71df8f2f83a5) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump next-themes from 0.2.1 to 0.4.6

- [#270](https://github.com/lsst-sqre/squareone/pull/270) [`26789ea`](https://github.com/lsst-sqre/squareone/commit/26789eab22b0d0697236a9f085be71df8f2f83a5) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump next from 15.5.2 to 15.5.6

- [#291](https://github.com/lsst-sqre/squareone/pull/291) [`5027c65`](https://github.com/lsst-sqre/squareone/commit/5027c650d8e64ee73c98dc840d6aed18bd1f6e97) Thanks [@jonathansick](https://github.com/jonathansick)! - Bump playwright from 1.55.0 to 1.56.1

- [#252](https://github.com/lsst-sqre/squareone/pull/252) [`4fa4584`](https://github.com/lsst-sqre/squareone/commit/4fa45848df9497ef6012b961596684481f2a5445) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump react-dom from 19.1.1 to 19.2.0

- [#264](https://github.com/lsst-sqre/squareone/pull/264) [`a266241`](https://github.com/lsst-sqre/squareone/commit/a266241e6b7e4ed3f3e8b87531440f6015306e13) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump react-hook-form from 7.62.0 to 7.66.0

- [#252](https://github.com/lsst-sqre/squareone/pull/252) [`4fa4584`](https://github.com/lsst-sqre/squareone/commit/4fa45848df9497ef6012b961596684481f2a5445) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump react from 19.1.1 to 19.2.0

- [#250](https://github.com/lsst-sqre/squareone/pull/250) [`eff9f7a`](https://github.com/lsst-sqre/squareone/commit/eff9f7a9716cdf974372f74f338a81f86f98f75c) Thanks [@jonathansick](https://github.com/jonathansick)! - Align dependency versions across packages to prepare for Dependabot groups

  - Update eslint-config-next from 12.2.4 to 15.5.0 in eslint-config package
  - Standardize eslint to 8.46.0 across squared and squareone packages
  - Update swr from 2.2.1 to 2.3.6 in squared package
  - Update @fortawesome/react-fontawesome from 0.2.0 to 0.2.2 in squareone package

  These version alignments eliminate inconsistencies that could cause conflicts when Dependabot groups are enabled for coordinated dependency updates.

- [#269](https://github.com/lsst-sqre/squareone/pull/269) [`c2de825`](https://github.com/lsst-sqre/squareone/commit/c2de825b768357572e37f6c8396bde57fdc11430) Thanks [@jonathansick](https://github.com/jonathansick)! - Upgrade to Storybook 10.0.6

  - Migrated both squared and squareone Storybook configurations to Storybook 10.0.6
  - Updated all Storybook addons and dependencies to v10
  - Applied ESM migration with standardized `import.meta.resolve()` for addon resolution
  - Added a11y testing configuration with 'todo' mode (shows violations without failing CI)
  - Improved vitest integration with a11y addon annotations in squared package

- [#279](https://github.com/lsst-sqre/squareone/pull/279) [`fc4e806`](https://github.com/lsst-sqre/squareone/commit/fc4e806547d421d672e0e78412dc3d4a6bb0b903) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump storybook from 10.0.6 to 10.0.7

- [#273](https://github.com/lsst-sqre/squareone/pull/273) [`28644d0`](https://github.com/lsst-sqre/squareone/commit/28644d0cbab26003fe1e3a6fe856337f09d7627f) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump turbo from 2.6.0 to 2.6.1

- [#287](https://github.com/lsst-sqre/squareone/pull/287) [`b145d65`](https://github.com/lsst-sqre/squareone/commit/b145d65bb77ee135c6c238f2c977c93c22424086) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump typescript from 5.9.2 to 5.9.3

- [#246](https://github.com/lsst-sqre/squareone/pull/246) [`33f3a82`](https://github.com/lsst-sqre/squareone/commit/33f3a82cfee7d1dfd1c4a1eef3b1a399e060ffec) Thanks [@jonathansick](https://github.com/jonathansick)! - Update Turborepo from 2.5.6 to 2.6.0

  This infrastructure update brings the latest improvements and bug fixes from Turborepo 2.6.0. Updated packages:

  - `turbo` from 2.5.6 to 2.6.0
  - `@turbo/gen` from 1.13.4 to 2.6.0

  The global turbo installation has been removed as it's not needed for this monorepo workflow - all commands use the local installation via `turbo-wrapper.js`.

- [#246](https://github.com/lsst-sqre/squareone/pull/246) [`8ddc6f3`](https://github.com/lsst-sqre/squareone/commit/8ddc6f38fc9afc9dc041b216514333db1ff4a760) Thanks [@jonathansick](https://github.com/jonathansick)! - Update pnpm from 10.12.1 to 10.20.0

  This infrastructure update improves package management performance and includes the latest bug fixes and security patches. The pnpm version is managed via corepack and specified in the root package.json.

- Updated dependencies [[`5027c65`](https://github.com/lsst-sqre/squareone/commit/5027c650d8e64ee73c98dc840d6aed18bd1f6e97), [`eff9f7a`](https://github.com/lsst-sqre/squareone/commit/eff9f7a9716cdf974372f74f338a81f86f98f75c), [`c2de825`](https://github.com/lsst-sqre/squareone/commit/c2de825b768357572e37f6c8396bde57fdc11430)]:
  - @lsst-sqre/squared@0.11.0

## 0.28.3

### Patch Changes

- [#247](https://github.com/lsst-sqre/squareone/pull/247) [`868aaeca5ce61b31cf099c132ae36cd3a70f0f82`](https://github.com/lsst-sqre/squareone/commit/868aaeca5ce61b31cf099c132ae36cd3a70f0f82) Thanks [@jonathansick](https://github.com/jonathansick)! - Filter available scopes in token creation form based on user's authentication token

  The token creation form now filters the available scopes to only show scopes that the user's current authentication token possesses. This prevents users from attempting to create tokens with scopes they don't have access to, providing a better user experience and clearer security boundaries. Changes:

  - Modified `/settings/tokens/new` page to filter `loginInfo.config.scopes` by `loginInfo.scopes`
  - Updated NewTokenPage Storybook story to match implementation and added a new `LimitedScopes` story demonstrating the filtering behavior

## 0.28.2

### Patch Changes

- Updated dependencies [[`3e4a8fb612ac14d0f1ec214ed09be4a567b6b16a`](https://github.com/lsst-sqre/squareone/commit/3e4a8fb612ac14d0f1ec214ed09be4a567b6b16a)]:
  - @lsst-sqre/squared@0.10.2

## 0.28.1

### Patch Changes

- [#242](https://github.com/lsst-sqre/squareone/pull/242) [`5641bc3b4b3e704d0cc489b3db909ee0b43fe317`](https://github.com/lsst-sqre/squareone/commit/5641bc3b4b3e704d0cc489b3db909ee0b43fe317) Thanks [@jonathansick](https://github.com/jonathansick)! - Improve dark mode accessibility and color system

  Enhanced dark mode support across components with improved text contrast for better accessibility:

  - Fixed button text visibility in dark theme (secondary buttons)
  - Fixed ClipboardButton success text contrast
  - Fixed DateTimePicker calendar hover states and year input backgrounds
  - Fixed TokenHistory hover text contrast
  - Improved token key text contrast in TokenDetailsView
  - Enhanced footer and general link contrast with blue-300 color
  - Adapted dropdown shadows for better dark mode visibility
  - Consolidated navigation menu viewport styling

  Added complete color ramps to design tokens:

  - Added missing primary color shades (primary-300, primary-400, primary-600, primary-700)
  - Added complete gray color scale (gray-100 through gray-900)
  - Added text-light token for improved light text on dark backgrounds

  These changes ensure WCAG AA compliance for text contrast in both light and dark themes.

- [#242](https://github.com/lsst-sqre/squareone/pull/242) [`5641bc3b4b3e704d0cc489b3db909ee0b43fe317`](https://github.com/lsst-sqre/squareone/commit/5641bc3b4b3e704d0cc489b3db909ee0b43fe317) Thanks [@jonathansick](https://github.com/jonathansick)! - Fix sidebar layout footer positioning

  Corrected footer positioning issues in SidebarLayout component to ensure the footer properly anchors to the bottom of the layout in all viewport sizes.

- [#242](https://github.com/lsst-sqre/squareone/pull/242) [`5641bc3b4b3e704d0cc489b3db909ee0b43fe317`](https://github.com/lsst-sqre/squareone/commit/5641bc3b4b3e704d0cc489b3db909ee0b43fe317) Thanks [@jonathansick](https://github.com/jonathansick)! - Add dark theme support to Storybook

  Added dark theme background support to both squareone and squared Storybook configurations, enabling proper testing and development of components in dark mode. This includes setting up the appropriate CSS custom properties for dark theme backgrounds in Storybook preview environments.

- [#242](https://github.com/lsst-sqre/squareone/pull/242) [`5641bc3b4b3e704d0cc489b3db909ee0b43fe317`](https://github.com/lsst-sqre/squareone/commit/5641bc3b4b3e704d0cc489b3db909ee0b43fe317) Thanks [@jonathansick](https://github.com/jonathansick)! - Fix TokenForm scope selector layout and focus behavior

  Replaced CSS columns with CSS Grid layout in TokenForm's ScopeSelector to fix focus ring fragmentation issues. The Grid layout provides better control over item positioning and prevents focus rings from being split across column breaks, improving keyboard navigation accessibility.

- Updated dependencies [[`5641bc3b4b3e704d0cc489b3db909ee0b43fe317`](https://github.com/lsst-sqre/squareone/commit/5641bc3b4b3e704d0cc489b3db909ee0b43fe317), [`5641bc3b4b3e704d0cc489b3db909ee0b43fe317`](https://github.com/lsst-sqre/squareone/commit/5641bc3b4b3e704d0cc489b3db909ee0b43fe317), [`5641bc3b4b3e704d0cc489b3db909ee0b43fe317`](https://github.com/lsst-sqre/squareone/commit/5641bc3b4b3e704d0cc489b3db909ee0b43fe317)]:
  - @lsst-sqre/squared@0.10.1
  - @lsst-sqre/rubin-style-dictionary@0.7.0
  - @lsst-sqre/global-css@0.2.4

## 0.28.0

### Minor Changes

- [#237](https://github.com/lsst-sqre/squareone/pull/237) [`af2ef1a46ed362af3aed65e4f212ec0f4d556cd8`](https://github.com/lsst-sqre/squareone/commit/af2ef1a46ed362af3aed65e4f212ec0f4d556cd8) Thanks [@jonathansick](https://github.com/jonathansick)! - Add MDX content support to Account settings page

  The Account settings page (`/settings`) now uses MDX for its content instead of hardcoded placeholder text. This enables deployments to customize account management instructions and external links via ConfigMaps.

  Key changes:

  - Account page loads content from `settings__index.mdx` using the existing MDX content system
  - Includes error handling with fallback content when MDX file is unavailable
  - Default content includes sections for account management, identity providers, and personal information
  - Uses `Lede` and `CtaLink` components for consistent styling
  - Deployments can provide custom MDX files via `mdxDir` configuration to include deployment-specific URLs and instructions for their account management systems (COManage, etc.)

- [#240](https://github.com/lsst-sqre/squareone/pull/240) [`a387930a65aecb397b22c8d275c8d9f31bbfd156`](https://github.com/lsst-sqre/squareone/commit/a387930a65aecb397b22c8d275c8d9f31bbfd156) Thanks [@jonathansick](https://github.com/jonathansick)! - Add Quotas page for viewing user resource limits

  A new Quotas page is now available at `/settings/quotas` that displays user quota allocations from Gafaelfawr for notebook servers, API rate limits, and TAP concurrent query limits.

  **New features:**

  - **QuotasView component**: Displays quota information organized into three conditional sections:
    - Notebooks section: Shows CPU cores, memory (GB), and spawning status (only displayed when disabled)
    - Rate limits section: Shows API request quotas per service in a 15-minute window
    - Concurrent queries section: Shows TAP database query limits per service
  - **Settings navigation**: Added "Quotas" link to the settings sidebar between "Access tokens" and "Sessions"
  - **Deep linking**: Each section has an anchor tag for direct linking (`#notebook`, `#rate-limit`, `#tap`)
  - **Empty states**: Sections are omitted when no data is available; "Not configured" message shown if entire quota object is missing

- [#228](https://github.com/lsst-sqre/squareone/pull/228) [`f5ec250ce28a0f2185aadd916608161f830318bb`](https://github.com/lsst-sqre/squareone/commit/f5ec250ce28a0f2185aadd916608161f830318bb) Thanks [@jonathansick](https://github.com/jonathansick)! - Add session tokens management pages

  Implements a new `/settings/sessions` section for viewing and managing web sessions, notebook sessions, and internal tokens. This feature provides users with a unified interface to monitor and control their active sessions across the platform.

  New pages:

  - **`/settings/sessions`** main page: Tab-based UI using the new Tabs component for type-based filtering with URL state management. `?type=` query parameter persists selected tab.
  - **`/settings/sessions/history`** page: Displays change history for sessions with tab-based navigation and filter persistence.
  - **`/settings/sessions/[id]`** details page: Shows detailed information for individual session tokens with edit/delete capabilities.

  New components:

  - **SessionTokensView component**: Displays tokens by type (web sessions, notebook sessions, internal tokens) with filtering, loading states, and error handling
  - **SessionTokenItem component**: Individual token card showing metadata (creation date, expiration, host), with delete functionality

### Patch Changes

- [#237](https://github.com/lsst-sqre/squareone/pull/237) [`d1a05ef7e32c9a20f38eeb7e36a384aeea21c69e`](https://github.com/lsst-sqre/squareone/commit/d1a05ef7e32c9a20f38eeb7e36a384aeea21c69e) Thanks [@jonathansick](https://github.com/jonathansick)! - Simplify user menu to show only Settings and Log out

  The user menu has been streamlined to display only two essential items:

  - **Settings** - Links to `/settings` page for all account and token management
  - **Log out** - Logs user out with proper redirect handling

  This change removes the conditional external "Account settings" link and consolidates the "Access tokens" link into a general "Settings" link. All settings pages remain accessible through the sidebar navigation at `/settings`, including:

  - Account settings (`/settings`)
  - Access tokens (`/settings/tokens`)
  - Sessions (`/settings/sessions`)

  This simplification improves the user experience by reducing menu clutter while maintaining full access to all functionality through the settings section.

- [#241](https://github.com/lsst-sqre/squareone/pull/241) [`7b013336c51bc891a4470a90a01bbcb58528fdaf`](https://github.com/lsst-sqre/squareone/commit/7b013336c51bc891a4470a90a01bbcb58528fdaf) Thanks [@jonathansick](https://github.com/jonathansick)! - Fix token creation error display for validation errors

  Resolved Sentry [SQUAREONE-26](https://rubin-observatory.sentry.io/issues/6981134766/events/1d39710f9f6e4fa1b0aa581ab120226a/): Fixed a crash that occurred when the Gafaelfawr API returned Pydantic validation errors during token creation. Previously, validation error objects were rendered directly in React, causing "Objects are not valid as a React child" errors.

- Updated dependencies [[`1d8161aa169c159762e28b0e3c1afaea5514ef15`](https://github.com/lsst-sqre/squareone/commit/1d8161aa169c159762e28b0e3c1afaea5514ef15), [`0e49cf80e8be37ffca6e7897ba07aa91881e7be3`](https://github.com/lsst-sqre/squareone/commit/0e49cf80e8be37ffca6e7897ba07aa91881e7be3), [`bf0a8e50a321874abe551ad148255b7546680f31`](https://github.com/lsst-sqre/squareone/commit/bf0a8e50a321874abe551ad148255b7546680f31)]:
  - @lsst-sqre/squared@0.10.0

## 0.27.0

### Minor Changes

- [#225](https://github.com/lsst-sqre/squareone/pull/225) [`1cc6934203efa93b02d6d48a2ac10d72d40bd87a`](https://github.com/lsst-sqre/squareone/commit/1cc6934203efa93b02d6d48a2ac10d72d40bd87a) Thanks [@jonathansick](https://github.com/jonathansick)! - Publish arm64 in addition to amd64 platform Docker images

  We now use https://github.com/lsst-sqre/multiplatform-build-and-push to generate amd64 and arm64 images for Squareone in parallel. This is packaged in our own reusable workflow at `.github/workflows/build-squareone.yaml` for use in CI and release workflow contexts.

## 0.26.1

### Patch Changes

- [#223](https://github.com/lsst-sqre/squareone/pull/223) [`7df569fdb5075cb6882444c53f09fcf1bc094d04`](https://github.com/lsst-sqre/squareone/commit/7df569fdb5075cb6882444c53f09fcf1bc094d04) Thanks [@jonathansick](https://github.com/jonathansick)! - Fix docker-release workflow for missing pnpm setup

  pnpm is now required to be present for the docker-release workflow because the root package.json specifies `pnpm` as the packageManager.

## 0.26.0

### Minor Changes

- [#205](https://github.com/lsst-sqre/squareone/pull/205) [`362b05ea70a859f982c01fd129328d126816dfba`](https://github.com/lsst-sqre/squareone/commit/362b05ea70a859f982c01fd129328d126816dfba) Thanks [@jonathansick](https://github.com/jonathansick)! - Adopted @storybook/addon-vitest for improved testing performance and browser-based testing

  - Run `pnpm test-storybook` to execute Storybook tests using Vitest

- [#208](https://github.com/lsst-sqre/squareone/pull/208) [`f6c8b474823fa07ed0940205858cd209bf67f2a6`](https://github.com/lsst-sqre/squareone/commit/f6c8b474823fa07ed0940205858cd209bf67f2a6) Thanks [@jonathansick](https://github.com/jonathansick)! - Fixed hydration mis-match warnings with the UserMenu

- [#208](https://github.com/lsst-sqre/squareone/pull/208) [`f6c8b474823fa07ed0940205858cd209bf67f2a6`](https://github.com/lsst-sqre/squareone/commit/f6c8b474823fa07ed0940205858cd209bf67f2a6) Thanks [@jonathansick](https://github.com/jonathansick)! - Add comprehensive sidebar layout system and settings pages

  - **New sidebar navigation page layout::**

    - `SidebarLayout`: Responsive layout component with mobile-first design, CSS Grid on desktop, and flexbox on mobile
    - `MobileMenuToggle`: Hamburger menu component with accessibility features and smooth animations
    - `Sidebar`: Navigation sidebar with sticky positioning and structured navigation sections
    - `SidebarNavItem`: Individual navigation items with hover, active, and focus states
    - `SidebarNavSection`: Grouped navigation with optional section labels

  - **Settings pages implementation:**
    - `SettingsLayout`: Settings-specific layout using the sidebar system with dynamic navigation
    - Pages: Account (`/settings/`), and Access Tokens (`/settings/tokens`)
    - Complete server-side rendering with proper `getServerSideProps` implementation

- [#210](https://github.com/lsst-sqre/squareone/pull/210) [`98a4d6560c08a72ba52be6d9e8017e89f7df2cbb`](https://github.com/lsst-sqre/squareone/commit/98a4d6560c08a72ba52be6d9e8017e89f7df2cbb) Thanks [@jonathansick](https://github.com/jonathansick)! - Configure Next.js to transpile squared package

  Added the @lsst-sqre/squared package to Next.js transpilePackages configuration to support the new build system that exports TypeScript source directly.

- [#220](https://github.com/lsst-sqre/squareone/pull/220) [`43a98d2009568d1b1b4f7d2fa2c641fcb6c18374`](https://github.com/lsst-sqre/squareone/commit/43a98d2009568d1b1b4f7d2fa2c641fcb6c18374) Thanks [@jonathansick](https://github.com/jonathansick)! - Add comprehensive token change history viewing

  Implements a complete token change history system that allows users to view the full audit trail of changes to their Gafaelfawr access tokens:

  **New Components:**

  - `TokenHistoryView` - Main view with filters, summary stats, and paginated history list
  - `TokenHistoryFilters` - Date range and event type filtering with URL state persistence
  - `TokenHistoryList` - Infinite scroll pagination for history entries
  - `TokenHistoryItem` - Individual change entry display with action-specific formatting
  - `TokenHistoryDetails` - Detailed change information with before/after comparisons
  - `TokenHistorySummary` - Statistics panel showing total changes, first/last activity
  - `TokenScopeBadge` - Visual badges for token scopes
  - `TokenScopeChangeBadge` - Diff display for scope modifications (added/removed)

  **New Hooks:**

  - `useTokenChangeHistory` - SWR-based infinite pagination for change history API
  - `useTokenHistoryFilters` - URL-based state management for filters
  - `useTokenDetails` - Fetch individual token details from Gafaelfawr API

  **New Pages:**

  - `/settings/tokens/history` - Global token change history for all user tokens
  - `/settings/tokens/[id]` - Individual token details with dedicated history view

  **Features:**

  - Infinite scroll pagination with "Load more" button
  - Date range filtering with DateTimePicker integration
  - Event type filtering (creation, revocation, expiration, scope changes, etc.)
  - URL-based filter state (shareable/bookmarkable filtered views)
  - Local timezone support with ISO 8601 format for all timestamps
  - Graceful handling of deleted tokens (shows history even when token no longer exists)
  - Responsive design with proper loading and error states
  - Comprehensive test coverage for all components and hooks

  This feature provides complete visibility into token lifecycle events, helping users understand token usage patterns and security-relevant changes.

- [#216](https://github.com/lsst-sqre/squareone/pull/216) [`7238f2ede9e3c1838311bea84d2c3c065be2ad13`](https://github.com/lsst-sqre/squareone/commit/7238f2ede9e3c1838311bea84d2c3c065be2ad13) Thanks [@jonathansick](https://github.com/jonathansick)! - Add comprehensive token creation workflow

  Implements a full-featured token creation system including:

  - New `/settings/tokens/new` page with form interface
  - Token name validation to prevent duplicates
  - Scope selection with configurable available scopes
  - Flexible expiration options (preset durations and custom dates)
  - Query parameter support for pre-filling form values from URL templates
  - Integration with Gafaelfawr token API for token creation
  - Success modal displaying newly created tokens with copy functionality
  - Enhanced navigation with "Access Tokens" link in settings

  This feature enables users to create personal access tokens with appropriate scopes and expiration settings through a guided interface.

- [#220](https://github.com/lsst-sqre/squareone/pull/220) [`43a98d2009568d1b1b4f7d2fa2c641fcb6c18374`](https://github.com/lsst-sqre/squareone/commit/43a98d2009568d1b1b4f7d2fa2c641fcb6c18374) Thanks [@jonathansick](https://github.com/jonathansick)! - Add token details page and enhance token management UI

  **New Features:**

  - Individual token details page at `/settings/tokens/[id]` showing comprehensive token information
  - `TokenDetailsView` component with metadata display (scopes, creation date, expiration, parent info)
  - Clickable token IDs throughout the UI that link to token details pages
  - "View history" button on main tokens page for quick access to change history
  - Standalone `TokenDate` component for consistent date/time formatting across views

  **Improvements:**

  - Removed confusing "Last used" date displays (data reliability issues)
  - Fixed token created date incorrectly showing as "Expired"
  - Better visual hierarchy in token listings with clickable elements
  - Consistent ISO 8601 timestamp display with relative time formatting
  - Proper handling of undefined/null token fields from API
  - Integration with token history viewing workflow

  **Components:**

  - `TokenDetailsView` - Full token information display with action buttons
  - `TokenDate` - Reusable date formatting component with semantic HTML time elements
  - Enhanced `AccessTokenItem` with clickable token ID links
  - Date formatter utilities for consistent timestamp handling

  This update improves the token management experience by providing dedicated detail views and clearer navigation between token information and change history.

- [#217](https://github.com/lsst-sqre/squareone/pull/217) [`8c5de054db869e7d02942e6c23ceaccab4f260bc`](https://github.com/lsst-sqre/squareone/commit/8c5de054db869e7d02942e6c23ceaccab4f260bc) Thanks [@jonathansick](https://github.com/jonathansick)! - Add token viewing and deletion functionality

  Implements comprehensive token management capabilities including:

  - New AccessTokensView component displaying user's existing tokens
  - AccessTokenItem component with semantic HTML time elements for dates
  - Token deletion workflow with confirmation modal
  - useDeleteToken hook for API integration with Gafaelfawr
  - Date formatting utilities with relative time display
  - Integration into `/settings/tokens` page alongside token creation
  - Proper handling of undefined/null token fields from API

  Users can now view their existing access tokens, see expiration and last-used dates, and delete tokens through a confirmation workflow. The interface provides clear visual feedback and follows the application's design system.

### Patch Changes

- Updated dependencies [[`98a4d6560c08a72ba52be6d9e8017e89f7df2cbb`](https://github.com/lsst-sqre/squareone/commit/98a4d6560c08a72ba52be6d9e8017e89f7df2cbb), [`9b6312854eee408a687b8c77978833032773934e`](https://github.com/lsst-sqre/squareone/commit/9b6312854eee408a687b8c77978833032773934e), [`024b11f8653bb1ade38240f890d8fbbb02aa0841`](https://github.com/lsst-sqre/squareone/commit/024b11f8653bb1ade38240f890d8fbbb02aa0841), [`7238f2ede9e3c1838311bea84d2c3c065be2ad13`](https://github.com/lsst-sqre/squareone/commit/7238f2ede9e3c1838311bea84d2c3c065be2ad13), [`0baaffd667f8d53aeb2963f36371415516b2c0ff`](https://github.com/lsst-sqre/squareone/commit/0baaffd667f8d53aeb2963f36371415516b2c0ff), [`98a4d6560c08a72ba52be6d9e8017e89f7df2cbb`](https://github.com/lsst-sqre/squareone/commit/98a4d6560c08a72ba52be6d9e8017e89f7df2cbb), [`c85b08254b7bc14688b9f889541962a0a0d511b4`](https://github.com/lsst-sqre/squareone/commit/c85b08254b7bc14688b9f889541962a0a0d511b4), [`4bdb71382f3c5a935a9309bd5e5cc32c8e2210e5`](https://github.com/lsst-sqre/squareone/commit/4bdb71382f3c5a935a9309bd5e5cc32c8e2210e5), [`362b05ea70a859f982c01fd129328d126816dfba`](https://github.com/lsst-sqre/squareone/commit/362b05ea70a859f982c01fd129328d126816dfba), [`7238f2ede9e3c1838311bea84d2c3c065be2ad13`](https://github.com/lsst-sqre/squareone/commit/7238f2ede9e3c1838311bea84d2c3c065be2ad13), [`514c4e752c0e6f3c35b58781d6584edd22de366a`](https://github.com/lsst-sqre/squareone/commit/514c4e752c0e6f3c35b58781d6584edd22de366a), [`5de611d8d5a4ebf5677241982d6932e5e2aa77d1`](https://github.com/lsst-sqre/squareone/commit/5de611d8d5a4ebf5677241982d6932e5e2aa77d1), [`3396e84b11d375679f9e93e12367e9b32c865cfd`](https://github.com/lsst-sqre/squareone/commit/3396e84b11d375679f9e93e12367e9b32c865cfd), [`a9e269c52e9259afd8657ca0c784b1aa966f0b27`](https://github.com/lsst-sqre/squareone/commit/a9e269c52e9259afd8657ca0c784b1aa966f0b27), [`98a4d6560c08a72ba52be6d9e8017e89f7df2cbb`](https://github.com/lsst-sqre/squareone/commit/98a4d6560c08a72ba52be6d9e8017e89f7df2cbb), [`e28bd8c294249c99d12af40d36fc8bd93cc9b9e4`](https://github.com/lsst-sqre/squareone/commit/e28bd8c294249c99d12af40d36fc8bd93cc9b9e4), [`c85b08254b7bc14688b9f889541962a0a0d511b4`](https://github.com/lsst-sqre/squareone/commit/c85b08254b7bc14688b9f889541962a0a0d511b4)]:
  - @lsst-sqre/squared@0.9.0
  - @lsst-sqre/rubin-style-dictionary@0.6.0
  - @lsst-sqre/global-css@0.2.3

## 0.25.0

### Minor Changes

- [#200](https://github.com/lsst-sqre/squareone/pull/200) [`279dbcb6352839f434a729cccdd9d12f74cf7eac`](https://github.com/lsst-sqre/squareone/commit/279dbcb6352839f434a729cccdd9d12f74cf7eac) Thanks [@jonathansick](https://github.com/jonathansick)! - Upgrade Next.js to version 15.5.0

  This is a major version upgrade from Next.js 14.x to 15.5.0, which includes:

  - New App Router improvements and features (although Squareone remains on the pages router)
  - Breaking changes in build system and runtime behavior (turbopack)
  - Updated instrumentation configuration
  - Performance improvements

  This upgrade may require configuration updates in consuming applications.

- [#200](https://github.com/lsst-sqre/squareone/pull/200) [`279dbcb6352839f434a729cccdd9d12f74cf7eac`](https://github.com/lsst-sqre/squareone/commit/279dbcb6352839f434a729cccdd9d12f74cf7eac) Thanks [@jonathansick](https://github.com/jonathansick)! - Upgrade Node.js to version 22.13.0 LTS

  Updated the Node.js runtime requirement from 18.x to 22.x LTS, which includes:

  - Latest LTS stability and security improvements
  - Updated build toolchain and CI environment
  - Improved performance and new language features

  This change updates the development environment and deployment requirements.

- [#200](https://github.com/lsst-sqre/squareone/pull/200) [`279dbcb6352839f434a729cccdd9d12f74cf7eac`](https://github.com/lsst-sqre/squareone/commit/279dbcb6352839f434a729cccdd9d12f74cf7eac) Thanks [@jonathansick](https://github.com/jonathansick)! - Upgrade React to version 19.1.1

  This is a major version upgrade from React 18.x to React 19.1.1, which includes:

  - New React 19 features and improvements
  - Updated TypeScript types for React 19
  - Breaking changes that may affect consumers

  This upgrade requires peer dependency updates in consuming applications.

- [#200](https://github.com/lsst-sqre/squareone/pull/200) [`279dbcb6352839f434a729cccdd9d12f74cf7eac`](https://github.com/lsst-sqre/squareone/commit/279dbcb6352839f434a729cccdd9d12f74cf7eac) Thanks [@jonathansick](https://github.com/jonathansick)! - Upgrade Storybook to version 9.1.3

  This is a major version upgrade from Storybook 7.x to 9.1.3, which includes:

  - New Storybook 9 features and testing capabilities
  - Updated addon ecosystem and configuration
  - Breaking changes in story format and testing utilities
  - Improved performance and build system
  - Migration from deprecated addons to new alternatives

  This upgrade includes configuration changes and may require story updates in consuming projects.

### Patch Changes

- [#200](https://github.com/lsst-sqre/squareone/pull/200) [`279dbcb6352839f434a729cccdd9d12f74cf7eac`](https://github.com/lsst-sqre/squareone/commit/279dbcb6352839f434a729cccdd9d12f74cf7eac) Thanks [@jonathansick](https://github.com/jonathansick)! - Fix build system and Storybook compatibility issues

  - Fix Turbo build outputs configuration for better caching
  - Add explicit React imports to Storybook files for CI compatibility
  - Fix ESLint compatibility with Turbo 2.5.6
  - Resolve Docker build corepack signature errors
  - Update build timeouts and pass required environment variables

  These changes improve build reliability and resolve compatibility issues in CI environments.

- Updated dependencies [[`279dbcb6352839f434a729cccdd9d12f74cf7eac`](https://github.com/lsst-sqre/squareone/commit/279dbcb6352839f434a729cccdd9d12f74cf7eac), [`279dbcb6352839f434a729cccdd9d12f74cf7eac`](https://github.com/lsst-sqre/squareone/commit/279dbcb6352839f434a729cccdd9d12f74cf7eac), [`279dbcb6352839f434a729cccdd9d12f74cf7eac`](https://github.com/lsst-sqre/squareone/commit/279dbcb6352839f434a729cccdd9d12f74cf7eac), [`279dbcb6352839f434a729cccdd9d12f74cf7eac`](https://github.com/lsst-sqre/squareone/commit/279dbcb6352839f434a729cccdd9d12f74cf7eac), [`279dbcb6352839f434a729cccdd9d12f74cf7eac`](https://github.com/lsst-sqre/squareone/commit/279dbcb6352839f434a729cccdd9d12f74cf7eac), [`279dbcb6352839f434a729cccdd9d12f74cf7eac`](https://github.com/lsst-sqre/squareone/commit/279dbcb6352839f434a729cccdd9d12f74cf7eac)]:
  - @lsst-sqre/squared@0.8.0

## 0.24.0

### Minor Changes

- [#197](https://github.com/lsst-sqre/squareone/pull/197) [`410c0329d2915b61763937977dd9e3a5c7a5e60c`](https://github.com/lsst-sqre/squareone/commit/410c0329d2915b61763937977dd9e3a5c7a5e60c) Thanks [@jonathansick](https://github.com/jonathansick)! - MDX content is now sourced from individual files, rather than as keys in the app configuration. The files are named after the page they correspond to. The MDX content directory is flat, with `__` standing in for a path separator. The directory that MDX is sourced from is configured via the mdxDir field in the configuration YAML.

- [#197](https://github.com/lsst-sqre/squareone/pull/197) [`410c0329d2915b61763937977dd9e3a5c7a5e60c`](https://github.com/lsst-sqre/squareone/commit/410c0329d2915b61763937977dd9e3a5c7a5e60c) Thanks [@jonathansick](https://github.com/jonathansick)! - Replaced next/config and getInitialProps with AppConfigContext that is loaded from getServerSideProps. Individual components can now access configuration from the useAppConfig hook.

  - Moved the client-side Sentry configuration to `_app.tsx` so that it can use the AppConfigContext. Previously it was loaded directly in the `instrumentation-client.js` hook that didn't have access to the app configuration.

- [#197](https://github.com/lsst-sqre/squareone/pull/197) [`c92f852908b16a8b429d9b616dfdcbb759de99ce`](https://github.com/lsst-sqre/squareone/commit/c92f852908b16a8b429d9b616dfdcbb759de99ce) Thanks [@jonathansick](https://github.com/jonathansick)! - Migrated Squareone to Typescript and Next.js 14!

  - Adopted the SWC compiler, replacing Babel, for improved performance and compatibility. This change preserves ES modules.
  - Updated TypeScript target to ES2017 and enabled strict type checking.
  - Updated SWR to v2.3.6.
  - Updated next-mdx-remote to v5.

- [#197](https://github.com/lsst-sqre/squareone/pull/197) [`410c0329d2915b61763937977dd9e3a5c7a5e60c`](https://github.com/lsst-sqre/squareone/commit/410c0329d2915b61763937977dd9e3a5c7a5e60c) Thanks [@jonathansick](https://github.com/jonathansick)! - Resolved server-side rendering (SSR) issues that were exposed by the TypeScript migration and new tree shaking:

  - Improved next-mdx-remote usage by ensuring that the `serialize` function is called from `getServerSideProps`.
  - Improved swr usage by segreagating it into client-side components that are dynamically imported.

### Patch Changes

- Updated dependencies [[`2b7c98f0bd660714e7f0c50635277664723f4fd5`](https://github.com/lsst-sqre/squareone/commit/2b7c98f0bd660714e7f0c50635277664723f4fd5), [`2b7c98f0bd660714e7f0c50635277664723f4fd5`](https://github.com/lsst-sqre/squareone/commit/2b7c98f0bd660714e7f0c50635277664723f4fd5)]:
  - @lsst-sqre/squared@0.7.0

## 0.23.0

### Minor Changes

- [`b41e337e5517caa3332ad78d5ee62fc96d1f13fc`](https://github.com/lsst-sqre/squareone/commit/b41e337e5517caa3332ad78d5ee62fc96d1f13fc) Thanks [@jonathansick](https://github.com/jonathansick)! - Update to Next 13.5

- [`4129cd39404ff5d14cd3716fbd526839f851b50e`](https://github.com/lsst-sqre/squareone/commit/4129cd39404ff5d14cd3716fbd526839f851b50e) Thanks [@jonathansick](https://github.com/jonathansick)! - Migrate components to use transitive props for styled-components.

- [`1d320df1a52dabda5b29f36715a4ab9d5eb92d1f`](https://github.com/lsst-sqre/squareone/commit/1d320df1a52dabda5b29f36715a4ab9d5eb92d1f) Thanks [@jonathansick](https://github.com/jonathansick)! - Update Sentry SDK to v10 and adopt instrumentation.ts configuration.

- [`a833b03b174e7d3e3c07b9bd86fe14fc80d25bcf`](https://github.com/lsst-sqre/squareone/commit/a833b03b174e7d3e3c07b9bd86fe14fc80d25bcf) Thanks [@jonathansick](https://github.com/jonathansick)! - Downgrade to Node 18.18.0 for better compatiblity with Next 12 and 13.

### Patch Changes

- [`fbcd10ea21883f1652dd0839a0573bc235e4edf4`](https://github.com/lsst-sqre/squareone/commit/fbcd10ea21883f1652dd0839a0573bc235e4edf4) Thanks [@jonathansick](https://github.com/jonathansick)! - Fixed the storybook build.

- Updated dependencies [[`b41e337e5517caa3332ad78d5ee62fc96d1f13fc`](https://github.com/lsst-sqre/squareone/commit/b41e337e5517caa3332ad78d5ee62fc96d1f13fc), [`4129cd39404ff5d14cd3716fbd526839f851b50e`](https://github.com/lsst-sqre/squareone/commit/4129cd39404ff5d14cd3716fbd526839f851b50e)]:
  - @lsst-sqre/squared@0.6.0

## 0.22.0

### Minor Changes

- [#192](https://github.com/lsst-sqre/squareone/pull/192) [`50d8d1f6cfef0318cb6c2767ba4feda8e120e348`](https://github.com/lsst-sqre/squareone/commit/50d8d1f6cfef0318cb6c2767ba4feda8e120e348) Thanks [@jonathansick](https://github.com/jonathansick)! - Migrate to React 18.3.1

  - Updated React from 17.0.2 to 18.3.1 across all packages
  - Updated React DOM to 18.3.1 for improved hydration and performance
  - Updated TypeScript types for React 18 compatibility
  - Updated styled-components to v5.3.11 for React 18 support
  - Updated Storybook React dependencies for compatibility

### Patch Changes

- [#192](https://github.com/lsst-sqre/squareone/pull/192) [`4d6a727f17ce694b75cdfae1318cb77d78e40dc7`](https://github.com/lsst-sqre/squareone/commit/4d6a727f17ce694b75cdfae1318cb77d78e40dc7) Thanks [@jonathansick](https://github.com/jonathansick)! - Modernize Dockerfile syntax

- Updated dependencies [[`50d8d1f6cfef0318cb6c2767ba4feda8e120e348`](https://github.com/lsst-sqre/squareone/commit/50d8d1f6cfef0318cb6c2767ba4feda8e120e348)]:
  - @lsst-sqre/squared@0.5.0

## 0.21.1

### Patch Changes

- [#190](https://github.com/lsst-sqre/squareone/pull/190) [`72971e97efef450f755238803ae125876f2021b9`](https://github.com/lsst-sqre/squareone/commit/72971e97efef450f755238803ae125876f2021b9) Thanks [@jonathansick](https://github.com/jonathansick)! - Update Next to 12.3.5

- [#190](https://github.com/lsst-sqre/squareone/pull/190) [`19087e3c5c18d243c0bf7a10da02c3f60127c99e`](https://github.com/lsst-sqre/squareone/commit/19087e3c5c18d243c0bf7a10da02c3f60127c99e) Thanks [@jonathansick](https://github.com/jonathansick)! - Downgraded Sentry SDK from v8 to v7 for compatibility with Next.js 12.3.5.

- [#190](https://github.com/lsst-sqre/squareone/pull/190) [`19087e3c5c18d243c0bf7a10da02c3f60127c99e`](https://github.com/lsst-sqre/squareone/commit/19087e3c5c18d243c0bf7a10da02c3f60127c99e) Thanks [@jonathansick](https://github.com/jonathansick)! - Added filtering in next.config.js to remove deprecated configuration properties that Sentry SDK adds but Next.js 12.3.5 doesn't recognize.

## 0.21.0

### Minor Changes

- [#188](https://github.com/lsst-sqre/squareone/pull/188) [`d24e59837c7c8057b03ea8d42d625e64e6fc5d0e`](https://github.com/lsst-sqre/squareone/commit/d24e59837c7c8057b03ea8d42d625e64e6fc5d0e) Thanks [@jonathansick](https://github.com/jonathansick)! - Add new "notice" and "outage" broadcast banners. This notice category replaces the earlier default ("maintenance") and is orange. Another new category, "outage", takes the red colour. This change is driven by Semaphore at https://github.com/lsst-sqre/semaphore/pull/109

### Patch Changes

- Updated dependencies [[`7a41984e02439cd16a2786196330492197f5c465`](https://github.com/lsst-sqre/squareone/commit/7a41984e02439cd16a2786196330492197f5c465)]:
  - @lsst-sqre/rubin-style-dictionary@0.5.1
  - @lsst-sqre/global-css@0.2.2
  - @lsst-sqre/squared@0.4.2

## 0.20.0

### Minor Changes

- [#186](https://github.com/lsst-sqre/squareone/pull/186) [`1dc078011cb6a1e87fbde6480ebbdf534c5ea9ee`](https://github.com/lsst-sqre/squareone/commit/1dc078011cb6a1e87fbde6480ebbdf534c5ea9ee) Thanks [@jonathansick](https://github.com/jonathansick)! - Adopt horizontal triad logo in header.

- [#186](https://github.com/lsst-sqre/squareone/pull/186) [`55df20028a802a7dcd33b14d599266517c05021a`](https://github.com/lsst-sqre/squareone/commit/55df20028a802a7dcd33b14d599266517c05021a) Thanks [@jonathansick](https://github.com/jonathansick)! - Update pnpm to 10.12.

- [#186](https://github.com/lsst-sqre/squareone/pull/186) [`c1bc9f3e517c5273588b21dd0368411575c6684d`](https://github.com/lsst-sqre/squareone/commit/c1bc9f3e517c5273588b21dd0368411575c6684d) Thanks [@jonathansick](https://github.com/jonathansick)! - Update funding notice text.

- [#186](https://github.com/lsst-sqre/squareone/pull/186) [`755428a010d4355994436b02dfb9a55801438ab7`](https://github.com/lsst-sqre/squareone/commit/755428a010d4355994436b02dfb9a55801438ab7) Thanks [@jonathansick](https://github.com/jonathansick)! - Use configured site name for homepage title.

- [#186](https://github.com/lsst-sqre/squareone/pull/186) [`10153b02ea62674a75b8c33acdff88351e8d2511`](https://github.com/lsst-sqre/squareone/commit/10153b02ea62674a75b8c33acdff88351e8d2511) Thanks [@jonathansick](https://github.com/jonathansick)! - Add a configurable preview badge that links to the roadmap doc.

  The preview badge appears on the homepage below the title. It's presence is configurable with the "showPreview" configuration. The link it follows is also configurable with "previewLink".

- [#186](https://github.com/lsst-sqre/squareone/pull/186) [`13e1fdce47cafe848413d5aa78e51cc767fda365`](https://github.com/lsst-sqre/squareone/commit/13e1fdce47cafe848413d5aa78e51cc767fda365) Thanks [@jonathansick](https://github.com/jonathansick)! - Update to Node 22.16 (current LTS).

### Patch Changes

- [#186](https://github.com/lsst-sqre/squareone/pull/186) [`9b717643a038f3936f520c2f85dfaa2d7ad2b0d3`](https://github.com/lsst-sqre/squareone/commit/9b717643a038f3936f520c2f85dfaa2d7ad2b0d3) Thanks [@jonathansick](https://github.com/jonathansick)! - Update partner logo lineup.

- Updated dependencies [[`9b717643a038f3936f520c2f85dfaa2d7ad2b0d3`](https://github.com/lsst-sqre/squareone/commit/9b717643a038f3936f520c2f85dfaa2d7ad2b0d3), [`1323de7a7e4deb3ada11ebbf650883c70221958f`](https://github.com/lsst-sqre/squareone/commit/1323de7a7e4deb3ada11ebbf650883c70221958f)]:
  - @lsst-sqre/rubin-style-dictionary@0.5.0
  - @lsst-sqre/global-css@0.2.1
  - @lsst-sqre/squared@0.4.1

## 0.19.0

### Minor Changes

- [#183](https://github.com/lsst-sqre/squareone/pull/183) [`a1a6cbe`](https://github.com/lsst-sqre/squareone/commit/a1a6cbeb77af55cc5c7a2c9c09310a565f4db290) Thanks [@jonathansick](https://github.com/jonathansick)! - Times Square now supports date and date-time parameter types.

## 0.18.0

### Minor Changes

- [#179](https://github.com/lsst-sqre/squareone/pull/179) [`92ecf5f`](https://github.com/lsst-sqre/squareone/commit/92ecf5f1b3d4e509552e1cb724cfb8dfd63efa45) Thanks [@jonathansick](https://github.com/jonathansick)! - Add a configurable Apps menu to the header navigation. This menu is for linking for non-aspect applications within the RSP, such as Times Square.

- [#179](https://github.com/lsst-sqre/squareone/pull/179) [`b4b2fdb`](https://github.com/lsst-sqre/squareone/commit/b4b2fdb72ea42adf3142ee53bdb463e9bfebe441) Thanks [@jonathansick](https://github.com/jonathansick)! - Moved auth URLs into Squared as a library. The `getLoginUrl` and `getLogout` URL functions compute the full URLs to the RSP's login and logout endpoints and include the `?rd` query strings to return the user to current and home URL respectively.

- [#179](https://github.com/lsst-sqre/squareone/pull/179) [`6be6b1c`](https://github.com/lsst-sqre/squareone/commit/6be6b1c5229444e293d0d1e84a263c499202934d) Thanks [@jonathansick](https://github.com/jonathansick)! - Reimplement `HeaderNav` using the `PrimaryNavigation` component from Squared. Although the menu looks the same visually, it is now entirely powered by the Radix `NavigationMenu` primitive so that any menu item can be a trigger for a menu rather than a link to another page. The Login / user menu is reimplemented as a menu item rather than with the special GafaelfawrUserMenu component.

### Patch Changes

- Updated dependencies [[`b4b2fdb`](https://github.com/lsst-sqre/squareone/commit/b4b2fdb72ea42adf3142ee53bdb463e9bfebe441), [`77274e7`](https://github.com/lsst-sqre/squareone/commit/77274e7a144158ac267f4b38a1e7dc48cb10f2de)]:
  - @lsst-sqre/squared@0.4.0

## 0.17.0

### Minor Changes

- [#175](https://github.com/lsst-sqre/squareone/pull/175) [`9cadf35`](https://github.com/lsst-sqre/squareone/commit/9cadf358e89410e475222e8a76a9e20056cf6119) Thanks [@jonathansick](https://github.com/jonathansick)! - The Times Square UI now closes its connection to the `/times-square/pages/:page/html/events?<qs>` SSE endpoint once the page instance's execution status is "complete" and the HTML hash is computed. With this change, the Times Square UI reduces its ongoing load on the API and also reduces network usage. The HTML page will still update to the latest version because the iframe component pings the Times Square `pages/:page/htmlstatus?<qs>` endpoint. We may back this off or convert the page update to an opt-in future in the future to further reduce network and API load from the front-end.

## 0.16.0

### Minor Changes

- [#176](https://github.com/lsst-sqre/squareone/pull/176) [`8e5b789`](https://github.com/lsst-sqre/squareone/commit/8e5b789ab0b4c591cca1f42db0e6cf773d8b0ccc) Thanks [@fajpunk](https://github.com/fajpunk)! - Added Sentry instrumentation to the `squareone` app.

  Both the NextJS client (frontend) and server (backend) code are instrumented with the official [Sentry NextJS integration](https://docs.sentry.io/platforms/javascript/guides/nextjs/). The Sentry DSN should be provided in a `SENTRY_DSN` environment variable. If a Sentry DSN is not provided, there will be no changes to app behaviour. If a Sentry DSN is provided, then these things will be sent to Sentry:

  - Any uncaught exceptions and error-level logs
  - Traces for user interaction (according to the sample settings)
  - Session replays for user interaction (according to the sample settings)

  There are new config file options for Sentry configuration:

  - `sentryTracesSampleRate`
  - `sentryReplaysSessionSampleRate`
  - `sentryReplaysOnErrorSampleRate`
  - `sentryDebug`

  There is a new route, `/sentry-example-page` which provides a way to quickly check that the Sentry integration is working.

## 0.15.0

### Minor Changes

- [#173](https://github.com/lsst-sqre/squareone/pull/173) [`c5dac7f`](https://github.com/lsst-sqre/squareone/commit/c5dac7ff7b8846e665918b32a7fdac8193615dfd) Thanks [@jonathansick](https://github.com/jonathansick)! - The Times Square interface now includes a link to its user documentation. The root of the environment-specific rsp.lsst.io site is configured through the new `docsBaseUrl` configuration parameter.

- [#173](https://github.com/lsst-sqre/squareone/pull/173) [`c5dac7f`](https://github.com/lsst-sqre/squareone/commit/c5dac7ff7b8846e665918b32a7fdac8193615dfd) Thanks [@jonathansick](https://github.com/jonathansick)! - Migrated Squareone CSS custom properties / design tokens to global-css from the globals.css file in the Squareone app

  With this change, any app as well as the Squared component library can use CSS custom properties such as the elevations (box-shadows, e.g. `--sqo-elevation-md`) and transitions (`--sqo-transition-basic`) that are included as global CSS custom properties.

### Patch Changes

- Updated dependencies [[`c5dac7f`](https://github.com/lsst-sqre/squareone/commit/c5dac7ff7b8846e665918b32a7fdac8193615dfd), [`c5dac7f`](https://github.com/lsst-sqre/squareone/commit/c5dac7ff7b8846e665918b32a7fdac8193615dfd)]:
  - @lsst-sqre/squared@0.3.0
  - @lsst-sqre/global-css@0.2.0

## 0.14.0

### Minor Changes

- [#171](https://github.com/lsst-sqre/squareone/pull/171) [`55ff9ab`](https://github.com/lsst-sqre/squareone/commit/55ff9ab52dc86c3b47f5ac4ca2fb5fc84d9ff15b) Thanks [@jonathansick](https://github.com/jonathansick)! - Add support for Plausible.io analytics

  In Squareone, set the `plausibleDomain` configuration to the Plausible tracking domain. E.g. data.lsst.cloud for the RSP. To disable Plausible tracking where it isn't supported, set this configuration to `null`.

## 0.13.1

### Patch Changes

- [#169](https://github.com/lsst-sqre/squareone/pull/169) [`c4eeb75`](https://github.com/lsst-sqre/squareone/commit/c4eeb75c85f290165313c2f9a7bc4cd814710a6c) Thanks [@jonathansick](https://github.com/jonathansick)! - Change "Account settings" menu item to title case.

## 0.13.0

### Minor Changes

- [#166](https://github.com/lsst-sqre/squareone/pull/166) [`157d03d`](https://github.com/lsst-sqre/squareone/commit/157d03db4fe3e559dc0071c1a1567200d376e1be) Thanks [@jonathansick](https://github.com/jonathansick)! - Usage of Reach UI is now removed and replaced with Radix UI. The user menu now uses `GafaelfawrUserMenu` from `@lsst-sqre/squared` and is based on Radix UI's Navigation Menu component. It is customized here to work with the Gafaelawr API to show a log in button for the logged out state, and to show the user's menu with a default log out button for the logged in state. Previously we also used Reach UI for showing an accessible validation alert in the Times Square page parameters UI. For now we've dropped this functionality.

### Patch Changes

- Updated dependencies [[`157d03d`](https://github.com/lsst-sqre/squareone/commit/157d03db4fe3e559dc0071c1a1567200d376e1be), [`f403ffd`](https://github.com/lsst-sqre/squareone/commit/f403ffd461983a579614d1ae4aa2c4b42537c294)]:
  - @lsst-sqre/squared@0.2.0

## 0.12.0

### Minor Changes

- [#164](https://github.com/lsst-sqre/squareone/pull/164) [`0574c00`](https://github.com/lsst-sqre/squareone/commit/0574c00b63b49418a35b95379f05e291848d667e) Thanks [@jonathansick](https://github.com/jonathansick)! - Users can now download the Jupyter Notebook (ipynb) file that they are viewing, with the current parameters filled in. This enables further interactive exploration.

- [#164](https://github.com/lsst-sqre/squareone/pull/164) [`2adb0af`](https://github.com/lsst-sqre/squareone/commit/2adb0af63bb1a69e59f68a33a1a31bdf30899bb2) Thanks [@jonathansick](https://github.com/jonathansick)! - Times Square notebook pages show a link to the source notebook on GitHub.

## 0.11.0

### Minor Changes

- [#153](https://github.com/lsst-sqre/squareone/pull/153) [`3561d09`](https://github.com/lsst-sqre/squareone/commit/3561d097d0c5cbe508f140f2bcd9041a540832a0) Thanks [@jonathansick](https://github.com/jonathansick)! - Squareone uses a base stylesheet from the @lsst-sqre/global-css package. This reduces the amount of global CSS managed in Squareone itself, and offloads configuring the Rubin Style Dictionary tokens into base CSS elements.

- [#163](https://github.com/lsst-sqre/squareone/pull/163) [`72dd989`](https://github.com/lsst-sqre/squareone/commit/72dd989ad963612204fa92a484a56abfbed4df8a) Thanks [@jonathansick](https://github.com/jonathansick)! - Implement background recomputation for cached Times Square pages. The "Recompute" button submits a request to Times Square's `DELETE /v1/pages/:page/html?{params}` endpoint, which causes a background recomputation of the notebook and re-rendering of the cached HTML.

  The new `TimesSquareHtmlEventsProvider` is a React context provider that provides real-time updates from Times Square about the status of an HTML rendering for a given set of parameters using Times Square's `/v1/pages/:page/html/events/{params}` endpoint. Squareone uses `@microsoft/fetch-event-source` to subscribe to this server-sent events (SSE) endpoint. Using this provider, the UI is able to show new data to the user, including the status of the computation, and once the computation is complete, the date/age of computation and the execution time.

- [#163](https://github.com/lsst-sqre/squareone/pull/163) [`72dd989`](https://github.com/lsst-sqre/squareone/commit/72dd989ad963612204fa92a484a56abfbed4df8a) Thanks [@jonathansick](https://github.com/jonathansick)! - The Times Square "Update" and "Reset" buttons are now disabled when appropriate. The Update button is disabled when the parameter inputs have not been changed relative to their current state. Likewise, the Reset button is disabled when the parameters are unchanged from the current state.

- [#153](https://github.com/lsst-sqre/squareone/pull/153) [`1240924`](https://github.com/lsst-sqre/squareone/commit/124092414c191eb16866304eafd9b6c4d428e2f6) Thanks [@jonathansick](https://github.com/jonathansick)! - Drop the use of normalize.css and instead rely on the base CSS from the global-css package.

- [#163](https://github.com/lsst-sqre/squareone/pull/163) [`72dd989`](https://github.com/lsst-sqre/squareone/commit/72dd989ad963612204fa92a484a56abfbed4df8a) Thanks [@jonathansick](https://github.com/jonathansick)! - New `TimesSquareUrlParametersProvider` component. This React context provides the URL-based state to Times Square components, such as the page being viewed, its notebook parameters values, and the display settings. This change simplifies the structure of the React pages by refactoring all of the URL parsing into a common component. As well, this context eliminates "prop drilling" to provide this URL-based state to all components in the Times Square application.

### Patch Changes

- Updated dependencies [[`b765732`](https://github.com/lsst-sqre/squareone/commit/b765732db52e354026294fce7b5ef7c32d32e553), [`5ee421b`](https://github.com/lsst-sqre/squareone/commit/5ee421bdd8f1c6f922913028ad48284f941189f1), [`9abbebb`](https://github.com/lsst-sqre/squareone/commit/9abbebba02fc1bc27fe2097fbbdb97110a9c93d9), [`30928a5`](https://github.com/lsst-sqre/squareone/commit/30928a5caa5392d7927fd3a2f017d48d77b68c1a), [`30928a5`](https://github.com/lsst-sqre/squareone/commit/30928a5caa5392d7927fd3a2f017d48d77b68c1a)]:
  - @lsst-sqre/squared@0.1.0
  - @lsst-sqre/global-css@0.1.0

## 0.10.3

### Patch Changes

- [#150](https://github.com/lsst-sqre/squareone/pull/150) [`1bcd1a4`](https://github.com/lsst-sqre/squareone/commit/1bcd1a45610f64eeb88ebd4c49572a679b0767a5) Thanks [@jonathansick](https://github.com/jonathansick)! - The squareone Docker image release is now triggered by a GitHub Release being published.

## 0.10.2

### Patch Changes

- [#148](https://github.com/lsst-sqre/squareone/pull/148) [`0e4d392`](https://github.com/lsst-sqre/squareone/commit/0e4d392afafe8437f39af3018ecf47d4a76567a2) Thanks [@jonathansick](https://github.com/jonathansick)! - Tweaks to the release process:

  - Use a custom GITHUB_TOKEN for the changesets/action in order to trigger the Docker release workflow for Squareone.

- Updated dependencies [[`0e4d392`](https://github.com/lsst-sqre/squareone/commit/0e4d392afafe8437f39af3018ecf47d4a76567a2)]:
  - @lsst-sqre/rubin-style-dictionary@0.4.2

## 0.10.1

### Patch Changes

- [#143](https://github.com/lsst-sqre/squareone/pull/143) [`13e6f4c`](https://github.com/lsst-sqre/squareone/commit/13e6f4c4415e913665dd8922c0e079dd0fefe7ba) Thanks [@jonathansick](https://github.com/jonathansick)! - Migrated lsst-sqre/squareone into a turbo-based monorepo. Rubin Style Dictionary is now a package inside the monorepo.
- Migrated to `pnpm` from `npm` for package management.
- Upgrade to Storybook 7.
- Add development set up documentation to the squareone.lsst.io site.

- Updated dependencies [[`13e6f4c`](https://github.com/lsst-sqre/squareone/commit/13e6f4c4415e913665dd8922c0e079dd0fefe7ba)]:
  - @lsst-sqre/rubin-style-dictionary@0.4.1

## 0.10.0 (2023-03-27)

### New features

- Add new pages for the COmanage sign-up flow. The content for these pages is configurable via [MDX](https://mdxjs.com) fields in `squareone.config.yaml`:

  - `verifyEmailPageMdx` for `/enrollment/thanks-for-signing-up`
  - `emailVerifiedPageMdx` for `/enrollment/thanks-for-verifying`
  - `pendingApprovalPageMdx` for `/enrollment/pending-approval`
  - `pendingVerificationPageMdx` for `/enrollment/pending-confirmation`

- Other pages' content are now configurable with MDX:

  - `apiAspectPageMdx` for `/api-aspect`
  - `docsPageMdx` for `/docs`
  - `supportPageMdx` for `/support`

## 0.9.0 (2023-03-01)

### New features

- Display an "Account settings" link in the user menu that goes to the COmanage Registry. This registry URL, which is optional, can be configured in `squareone.config.yaml` with the `coManageRegistryUrl` field.

## 0.8.1 (2022-08-25)

### Bug fixes

- Improved UI for Times pull request preview pages.

### Development changes

- Added additional stories and integration with Chromatic, the hosted Storybook service.

## 0.8.0 (2022-08-18)

### New features

- New pages for Times Square to preview pages in GitHub pull requests at `/times-square/github-pr/:owner/:repo:/:commit` paths.

### Development changes

- Initial integration with Storybook for designing and documenting components within Squareone.

## 0.7.1 (2022-06-26)

### Bug fixes

- Link to DP0.2 documentation.

## 0.7.0 (2022-06-23)

### New features

- Add initial support for [Times Square](https://github.com/lsst-sqre/times-square).
- Update background image for the homepage hero component to a new image by Bruno Quint, taken September 2021.

### Development changes

- Refresh dependencies.

## 0.6.0 (2022-04-14)

### New features

- Informational broadcast messages are now displayed with Rubin's primary teal as the background color (see [lsst-sqre/semaphore#29](https://github.com/lsst-sqre/semaphore/pull/29) for more information).
- Replaced custom fetch hook for the Semaphore broadcast message data with swr, enabling us to automatically refresh broadcast data.
- Updated the component layout in the source code.

## 0.5.0 (2022-04-06)

### New features

- Squareone is cross-published on the GitHub Container Registry at `ghcr.io/lsst-sqre/squareone`.

### Bug fixes

- Fix minor UI issues, including unnecessary scrollbars in the broadcast message disclosures and `Link` usage.
- Remove the note on the documentation page about Generation 3 middleware.

### Development changes

- Upgrade to Next 12 and various upgrades of dependencies and linting tools.
- Upgrade to Node 16.

## 0.4.0 (2021-08-11)

### New features

- Broadcast messages are now sourced through `Semaphore <https://github/lsst-sqre/semaphore>`_, a service that is installed in the science platform and sources messages from GitHub. With this update, messages can also have additional information that is visible if a user clicks on a "Read more" button. This disclosure is powered by `react-a11y-disclosure <https://github.com/KittyGiraudel/react-a11y-disclosure>`_.

- There is a new configuration field, `semaphoreUrl`, to configure the root URL for the Semaphore API service. The `broadcastMarkdown` field is removed.

## 0.3.1 (2021-08-04)

### Bug fixes

- Update funding text.

### Development changes

- Refresh README with status badges and revise text on git hooks.

## 0.3.0 (2021-07-12)

### New features

- Add a broadcastMarkdown configuration field to the public configuration schema. If set, this content is shown in a new BroadcastBanner component on any page. This is a configuration-driven way of displaying notifications to users without requiring code changes. The semaphore application will add further flexibility for pushing notifications in the future.

### Bug fixes

- Fix the name of the GitHub repository for support on the `/support` page.

## 0.2.2 (2021-06-25)

### Bug fixes

- Revised capitalization in the Acceptable Use Policy.

## 0.2.1 (2021-06-24)

### Bug fixes

- Add description on how to use the auth token with TAP clients that rely on basic authentication (username and password).

## 0.2.0 (2021-06-24)

### New features

This release includes many features in preparation for DP0.1:

- New `/docs` page that links to data, service, and software documentation relevant to RSP users.
- New `/api`-aspect page that provides information about how to access the TAP API.
- New `/terms` page that includes the RSP Acceptable Use Policy
- New `/support` page that describes how to get support.

### Bug fixes

- Fix open graph metadata

## 0.1.5 (2021-05-06)

### Bug fixes

- Update funding agency text and logos to the operations era.

## 0.1.4 (2021-05-03)

### Bug fixes

- Fix CSS loading for the UserMenu component by adding the babel styled-components plugin.
- Change the UserMenu component to display the username rather than the user's name, as Gafaelfawr does not guarantee the "name" property is available.
- Switch to Font Source for the Source Sans font (from Google Fonts).
- Remove temporary content from the index page.

## 0.1.3 (2021-04-05)

### Bug fixes

- Fix hero links for Portal and Notebooks
- Enable links in nav bar
- Enable documentation links

## 0.1.2 (2021-04-05)

### Bug fixes

- Fix how the configuration path is computed.

## 0.1.1 (2021-04-05)

### Bug fixes

- This release adds next.config.js to the Docker image.

## 0.1.0 (2021-03-30)

### New features

This is the first development release of Squareone! 🎉
