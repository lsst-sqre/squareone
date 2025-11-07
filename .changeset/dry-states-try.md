---
---

# Docker Version Validation System

Add automated validation to ensure Dockerfile versions stay synchronized with package.json.

## Changes

- **Validation Script**: Created `scripts/validate-docker-versions.js` to automatically validate version consistency between Dockerfiles and package.json
  - Validates Node.js versions (major.minor match)
  - Validates pnpm versions (exact match)
  - Validates Turbo versions (exact match)
  - Discovers all Dockerfiles in repository
  - Maps each Dockerfile to appropriate package.json (monorepo-aware)

- **Pre-commit Integration**: Updated `.lintstagedrc.mjs` to run validation when Dockerfile changes are staged

- **CI Integration**: Added validation step to `.github/workflows/ci.yaml` to catch version mismatches in CI pipeline

- **Manual Command**: Added `pnpm validate-docker` script for on-demand validation

- **Documentation**:
  - Created comprehensive Claude skill at `.claude/skills/docker-version-validation/`
  - Updated `CLAUDE.md` with validation command and skill reference
  - Updated `.claude/README.md` with skill documentation

## Validation Rules

- **Node.js**: Major.minor versions must match (patch differences allowed)
  - Example: Dockerfile `22.21.1` matches package.json `^22.21.1` ✓

- **pnpm**: Exact version match required
  - Example: Dockerfile `10.20.0` must match packageManager `pnpm@10.20.0` ✓

- **Turbo**: Exact version match required
  - Example: Dockerfile `2.6.0` must match devDependencies.turbo `2.6.0` ✓

## Integration Points

1. **Pre-commit hook** (via lint-staged) - Validates before commit when Dockerfile changes
2. **CI pipeline** (GitHub Actions) - Validates on every push/PR
3. **Manual validation** - Run `pnpm validate-docker` anytime

This prevents version drift between Docker builds and package configurations, ensuring consistency across development, CI, and production environments.
