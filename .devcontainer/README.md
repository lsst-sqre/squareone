# Codespaces Development Environment

This directory contains the GitHub Codespaces / VS Code Dev Container configuration for the squareone monorepo.

## Quick Start

1. Click "Code" → "Create codespace on main" in GitHub
2. Wait for container to build (first time: ~3-5 minutes)
3. Run `pnpm dev` to start development servers

## What's Included

- Node.js 22 with pnpm via Corepack
- Python 3.13 with uv for documentation building
- Git and GitHub CLI
- VS Code extensions: ESLint, Prettier, TypeScript, Python, Ruff, Vitest, MDX, Copilot
- Port forwarding: 3000 (squareone), 6006 (squared storybook), 6007 (squareone storybook)
- Persistent pnpm store (survives rebuilds)
- Pre-configured VS Code tasks for dev, storybook, testing, docs, and CI

## Turborepo Remote Cache

**For repository collaborators**: Remote caching is automatically enabled via repository secrets and devcontainer configuration.

- **TURBO_API** (pre-configured): `https://roundtable.lsst.cloud/turborepo-cache` - Custom cache server URL (set in devcontainer)
- **TURBO_TOKEN** (repository secret): Authentication token for cache access
- **TURBO_TEAM** (repository secret): `lsst-sqre` - Team identifier

**For external contributors**: You won't have access to the remote cache. This is intentional for security. Builds will use local caching only, which works perfectly fine but may be slower on first build.

## Common Tasks

**VS Code Tasks** (Command Palette → "Tasks: Run Task"):

- **Dev: All Apps** - Start all dev servers (Default: `Cmd/Ctrl+Shift+B`)
- **Dev: Squareone Only** - Start just squareone
- **Storybook: Squared** - Component library storybook (port 6006)
- **Storybook: Squareone** - App storybook (port 6007)
- **CI: Local CI Pipeline** - Run full CI locally (format, lint, type-check, test, build)
- **Test: All** - Run all tests
- **Lint: All** - Run ESLint
- **Type Check: All** - Run TypeScript checking
- **Docs: Build** - Build Sphinx documentation

See `.vscode/tasks.json` for the complete list of 25+ tasks!

**Or use terminal commands:**

```bash
# Development
pnpm dev                    # Start all dev servers
pnpm dev --filter squareone # Start only squareone app

# Storybook
pnpm storybook --filter @lsst-sqre/squared  # Squared (port 6006)
pnpm storybook --filter squareone           # Squareone (port 6007)

# Building
pnpm build                  # Build all packages
pnpm build --filter squared # Build only squared package

# Testing
pnpm test                   # Run unit tests
pnpm test-storybook         # Run Storybook tests
pnpm lint                   # Run ESLint
pnpm type-check             # Run TypeScript checks

# CI Pipeline
pnpm localci                # Run complete CI locally

# Documentation
pnpm docs                   # Build Sphinx documentation
uv run noxfile.py -s docs   # Direct nox command
uv run noxfile.py -s docs-linkcheck  # Check for broken links

# Turborepo
pnpm turbo run build --dry  # See what would be executed
```

## Troubleshooting

### Git safe directory warnings

If you see git warnings, run:

```bash
git config --global --add safe.directory /workspaces/squareone
```

### pnpm not found

Make sure Corepack is enabled:

```bash
corepack enable
```

### Port already in use

Kill the process:

```bash
lsof -ti:3000 | xargs kill -9
```

## Customization

Personal customizations should go in your user settings, not in this shared configuration:

- Command Palette → "Preferences: Open User Settings (JSON)"
- Add your preferred themes, keybindings, etc.
