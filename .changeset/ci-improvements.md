---
"squareone": patch
---

Improve CI validation with better tooling and local testing

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
