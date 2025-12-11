# @lsst-sqre/file-factory

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
