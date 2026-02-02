---
"@lsst-sqre/eslint-config": minor
"@lsst-sqre/squared": patch
"squareone": patch
---

Migrate ESLint configuration to v9 flat config format

- Replace legacy `.eslintrc.js` files with `eslint.config.mjs` across all packages and apps
- Convert shared `@lsst-sqre/eslint-config` to export a flat config array using `eslint-config-turbo/flat` and `FlatCompat` for `eslint-config-next`
- Add `@eslint/eslintrc` dependency for FlatCompat bridging where native flat config is not yet available
- Remove inline `eslintConfig` from squareone's `package.json` in favor of a standalone `eslint.config.mjs`
- Add explicit `lint` script to squareone
