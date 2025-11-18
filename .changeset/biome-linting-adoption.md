---
"squareone": patch
"@lsst-sqre/squared": patch
---

Add Biome linting alongside ESLint for comprehensive code quality

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
