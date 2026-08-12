---
name: biome-migrate
description: |
  Run `biome migrate` whenever the @biomejs/biome version changes so biome.json's
  $schema (and any deprecated config) stays in sync with the installed Biome.
  Use when processing a dependabot PR that bumps @biomejs/biome (it arrives via the
  monthly npm development group), when biome:lint/biome:format reports an info like
  "Expected: <new> Found: <old> — Run the command biome migrate", or any time you
  notice biome.json's $schema version lagging the installed Biome, or when the
  "Validate Biome schema version" CI step (validate-biome-schema.js) fails.
  Trigger keywords: biome, @biomejs/biome, biome migrate, biome.json, $schema
  mismatch, schema version, dependabot biome bump, Biome upgrade.
allowed-tools:
  - Bash(pnpm exec biome migrate:*)
  - Bash(pnpm exec biome --version:*)
  - Bash(pnpm run biome:format:check:*)
  - Bash(pnpm run biome:lint:*)
---

# Biome migrate on version bumps

When the pinned Biome version changes, `biome.json` can fall behind the new
release: its `$schema` URL still points at the old version, and a larger jump
may leave deprecated config keys in place. Biome ships `biome migrate` to
reconcile the config file with the installed binary. This is a **required
follow-up** to any Biome version bump — most often a dependabot PR.

## When to use this skill

- **Processing a dependabot PR that bumps `@biomejs/biome`.** Biome is a
  devDependency, so it arrives in the npm **`development`** group — a monthly
  catchall covering every development-type dependency (e.g. the group PR that
  moved Biome `2.3.14` → `2.5.7` alongside 21 other packages). It never arrives
  as a lone "bump @biomejs/biome" PR, so check each `development` group PR's
  file list for a `@biomejs/biome` change. See the user-level
  `rubin-dependabot-triage` skill for the overall triage flow; this skill is the
  Biome-specific step to fold into it.

  Because the group is a catchall on a monthly cadence, these PRs are large and
  can cross several Biome minor versions at once — expect the migrate to rename
  config keys, not just bump `$schema`, and expect new-in-that-version lint
  rules and formatter changes to require follow-up fixes in the same PR.
- **`biome:lint` / `biome:format:check` prints a schema info**, for example:

  ```
  i Expected: 2.3.14
    Found:    2.3.12
  i Run the command biome migrate to migrate the configuration file.
  ```

  This is *info*-level and does **not** fail lint, so it is easy to miss — but
  it is the signal that a migrate is overdue.
- **The `validate-biome-schema` check fails.** `biome:lint`'s info is only
  advisory, so `validate-biome-schema.js` turns the drift into a hard failure —
  it runs as the "Validate Biome schema version" CI step, on pre-commit when
  `biome.json` is staged, and in `pnpm localci`. When it fails it prints the same
  two-step hint (run the command, or use this skill).
- **You notice `biome.json`'s `$schema` lagging** the installed Biome during any
  other workflow (a rebase, a manual dependency change, etc.).

## The fix

Biome is invoked at the repo root via `pnpm exec biome` (there is no
`biome:migrate` npm script). From the repo root:

```bash
pnpm exec biome migrate --write
```

For a routine patch/minor bump this rewrites only the `$schema` line, e.g.:

```diff
-  "$schema": "https://biomejs.dev/schemas/2.3.12/schema.json",
+  "$schema": "https://biomejs.dev/schemas/2.3.14/schema.json",
```

A larger version jump may also migrate renamed or deprecated config keys —
review the full diff and keep the migrated result. The `2.3.14` → `2.5.7`
migrate, for instance, also renamed every per-group rule preset:

```diff
   "linter": {
     "rules": {
-      "recommended": true,
+      "preset": "recommended",
```

## After the migrate: expect fallout from the new version

`biome migrate` only reconciles the config file. The newly-installed Biome may
also format differently or promote new rules to errors, and those show up in the
*next* CI step rather than in the migrate itself. After migrating, run the
formatter and linter and fold any fixes into the same commit:

```bash
pnpm run biome:format   # biome check --write — applies formatting + safe autofixes
pnpm run biome:lint     # must report 0 errors; warnings are allowed
```

`biome:format` rewrites files in place, so review its diff rather than assuming
it was a no-op. Anything `biome:lint` still reports as an *error* needs a real
code change — the repo's own idioms are usually the cheapest fix. For example,
2.5 promoted `correctness/noUnsafeOptionalChaining`, which flags
`(init?.headers as Record<string, string>)['x-csrf-token']`; the fix was to
adopt the two-statement form already used elsewhere in the same test suite.

## Verify

```bash
# the enforcement check should pass (exit 0, "Biome schema is in sync")
pnpm run validate-biome

# $schema version should now match the installed Biome
grep '"\$schema"' biome.json
pnpm exec biome --version

# the schema info should be gone (both exit clean, no "Run the command biome migrate")
pnpm run biome:format:check
pnpm run biome:lint
```

## Landing the change

- **On a dependabot PR:** apply the migrate on the PR's own branch so the config
  bump and the migrate ship together. Following `rubin-dependabot-triage`, check
  the branch out in a worktree, run `pnpm exec biome migrate --write`, commit
  (e.g. `chore: run biome migrate for the <old>→<new> bump`), and push to the
  same branch — dependabot PRs accept maintainer pushes.
- **After the bump already merged** (you spotted the drift late): make a small
  follow-up branch off `main` and run the migrate there.
- **No changeset needed.** `biome.json` is repo-root tooling config, not part of
  any published package, so this change does not get a Changeset.
