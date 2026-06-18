---
'squareone': patch
---

Resolve Dependabot security advisories by updating vulnerable dependencies. `@sentry/nextjs` is bumped to `^10.58.0` (which drops the vulnerable transitive `uuid@9`) and `@turbo/gen` to `^2.9.18` (which drops the vulnerable `@turbo/workspaces`). The remaining advisories are addressed with `pnpm.overrides` in `pnpm-workspace.yaml` that pin vulnerable transitive packages up to their patched versions — including `vite` (7.3.5), `webpack` (5.107.2), `rollup`, `esbuild`, `postcss`, `ws`, `handlebars`, `lodash`/`lodash-es`, `minimatch`, `picomatch`, `glob`, `immutable`, `flatted`, `fast-uri`, `@babel/core`, `@opentelemetry/core`, and `js-yaml` (4.x). `vite` and `webpack` are also declared as root dev dependencies so pnpm applies the pinned versions to these otherwise auto-installed peer dependencies.

This clears 45 of the 46 distinct advisories. The one exception is `js-yaml@3.14.2`, pulled in only by the Changesets CLI (`@manypkg/get-packages` → `read-yaml-file@1.1.0`), which requires js-yaml 3.x and cannot be upgraded without breaking that dev-only tooling.
