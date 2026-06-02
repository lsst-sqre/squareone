---
name: project-mechanics
description: Project-specific build/test/lint/typing commands for this repo. Read this skill at the start of any phase that runs validation (`stoker-work`, `stoker-fixup`, `stoker-rebase`).
---

# Project mechanics

This file is the source of truth for how this repo runs tests, lint,
and type-checking. Profile-shipped phase skills read it at the start
of each phase and use the named commands verbatim.

This is a Node/TypeScript monorepo (pnpm + Turborepo + Changesets).
Always run pnpm scripts from the repo root with `--filter`; never
`cd` into an individual package (that bypasses Turborepo remote
caching). The only Python is the Sphinx docs build (see Final
validation).

## Test commands

- `focused_test`: `pnpm --filter <pkg> exec vitest run <path>` (e.g.
  `pnpm --filter @lsst-sqre/squared exec vitest run src/components/Button/Button.test.tsx`;
  add `-t '<name>'` to narrow to one test, or `--project=unit` to skip
  the storybook project)
- `complete_test`: `pnpm test`

## Lint

- `lint_touched`: `pnpm exec biome check --write {files}`
- `lint_all`: `pnpm run biome:format:check && pnpm run prettier:yaml && pnpm run biome:lint && pnpm run lint`

## Typing

- `typing`: `pnpm type-check`

## Visual & interaction validation

For changes that affect rendering or user interaction, don't rely on
unit tests alone — run the relevant server and observe the real UI
with the Playwright MCP (or Chrome). Start the server in the
background, then drive it: `browser_navigate` to the URL,
`browser_snapshot` for the accessibility tree, `browser_take_screenshot`
to inspect visuals, `browser_click`/`browser_type`/`browser_fill_form`
to exercise interactions, and `browser_console_messages` to catch
runtime errors.

- App (squareone): `pnpm dev --filter squareone` → http://localhost:3000
- Storybook (squared components): `pnpm storybook --filter @lsst-sqre/squared` → http://localhost:6006
- Storybook (squareone): `pnpm storybook --filter squareone` → http://localhost:6007

Storybook is the fastest way to validate a single component in
isolation; use the app dev server for page-level and integration
behavior. These servers are persistent — start them in the background
and leave them running while you iterate.

## Final validation

End-of-task validation runs `pnpm test` + `lint_all` (the
`biome:format:check && prettier:yaml && biome:lint && lint` chain
above) + `pnpm type-check`, in that order. For UI-affecting changes,
also validate rendering and interactions per **Visual & interaction
validation** above.

Extras, run only when the change touches the relevant area:

- Production build: `pnpm build` — CI builds the app; run it when a
  change could affect the Next.js/production build, since it catches
  errors `test`/`type-check` miss.
- Docker versions: `node scripts/validate-docker-versions.js` — run
  when a `Dockerfile*` changes.
- Docs: `uv run noxfile.py -s docs` (Sphinx via documenteer) — run
  when `docs/**` changes. For tasks that specifically refine the
  squareone docs, build the docs with this command inside the
  development loop, not just at the end. `uv run noxfile.py -s docs-linkcheck`
  is a useful extra final check but makes outbound network requests and
  may not work behind the sandbox firewall, so don't run it by default.

`pnpm localci` runs the core gate (Docker validation, format check,
YAML check, ESLint, type-check, test, build, Biome lint) in one shot;
prefer the granular commands above so each phase runs only what it
needs, and reach for `localci` when you want the full pre-push gate.

## Monorepo selectors

When a change is scoped to one package, scope the commands to it with
`--filter <pkg>`:

- App `apps/squareone` → `--filter squareone`
- Package `packages/squared` → `--filter @lsst-sqre/squared`
- Other packages use their `@lsst-sqre/<name>` package name (e.g.
  `--filter @lsst-sqre/global-css`, `--filter @lsst-sqre/times-square-client`)

Examples: `pnpm test --filter squareone`,
`pnpm type-check --filter @lsst-sqre/squared`,
`pnpm run lint --filter squareone`. Biome (`biome:lint`,
`biome:format:check`) always runs across the whole repo from root and
is not filtered per-package.

<!-- stoker-onboarded-from: github.com/lsst-sqre/rubin-stoker//profile@main
     prompt-hash: 353d09308c405a6aa0360d12547d6955784660346220564052d866ed25ad028c
     onboarded-at: 2026-06-02T17:32:01Z -->
