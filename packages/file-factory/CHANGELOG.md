# @lsst-sqre/file-factory

## 0.3.0

### Minor Changes

- [#699](https://github.com/lsst-sqre/squareone/pull/699) [`4589fc6`](https://github.com/lsst-sqre/squareone/commit/4589fc60c884b64837c4c53029dbdae503ce77ae) Thanks [@jonathansick](https://github.com/jonathansick)! - Update zod from 3 to 4. The exported schemas and inferred types are unchanged, but `ZodError` instances thrown on API contract drift now have zod 4's shape. Record schemas declare their string keys explicitly, and ISO datetime and URL fields use the top-level `z.iso.datetime()` and `z.url()` validators. The file-factory lifecycle hooks are validated with `z.custom()` rather than the removed `z.function().args().returns()` chain, and nested config sections use `.prefault({})` so their inner defaults still apply. The test-data generators in the client packages now use `zod-schema-faker`, which supports zod 4, in place of `@anatine/zod-mock`.

### Patch Changes

- [#692](https://github.com/lsst-sqre/squareone/pull/692) [`a779bf7`](https://github.com/lsst-sqre/squareone/commit/a779bf74a4b0900c2da31cb5a0bb553ff0392915) Thanks [@jonathansick](https://github.com/jonathansick)! - Update the Node.js runtime from 22 to the 24 LTS line (24.21.0). The Docker image, GitHub Actions workflows (via `.nvmrc`), the devcontainer, the `engines` field, and `@types/node` all move together.

- [#696](https://github.com/lsst-sqre/squareone/pull/696) [`d1fe661`](https://github.com/lsst-sqre/squareone/commit/d1fe66182b24081cb33893c29e23d0c379c7481e) Thanks [@jonathansick](https://github.com/jonathansick)! - Update TypeScript from 5.9 to 6.0, the bridge release before the native TypeScript 7 compiler. The shared `base.json` preset now uses `moduleResolution: "bundler"` instead of the removed `node` (node10) mode, and squareone drops the deprecated `baseUrl` in favor of a relative `paths` entry. Both options stop working in TypeScript 7.

## 0.2.0

### Minor Changes

- [#324](https://github.com/lsst-sqre/squareone/pull/324) [`eee05ea`](https://github.com/lsst-sqre/squareone/commit/eee05eab0de68eb9824590c8cea0520f5e0868dc) Thanks [@jonathansick](https://github.com/jonathansick)! - Add file-factory CLI tool for scaffolding React components, hooks, contexts, and pages

  This new package provides:

  - `file-factory component` - Create React components with optional CSS Modules, tests, and Storybook stories
  - `file-factory hook` - Create React hooks with optional directory structure
  - `file-factory context` - Create global React context providers
  - `file-factory page` - Create Next.js pages (both Pages Router and App Router)

  Features:

  - Directory-as-template pattern (like cookiecutter)
  - Component-scoped contexts with `--with-context` flag
  - Automatic barrel file updates
  - Package-specific configuration via `.file-factory/config.ts`
  - Custom template overrides
  - TypeScript throughout with Zod validation
  - Interactive mode when no arguments provided
