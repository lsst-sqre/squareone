---
'squareone': patch
'@lsst-sqre/squared': patch
---

Adopt Biome as primary code formatter

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
