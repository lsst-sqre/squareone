# Create Changesets

Review the changes on this branch, compared to the `main` branch and create changeset markdown files in the `.changeset` directory. You will need to create the changeset markdown files directly because the changeset command-line interface does not work well with agents.

In each changeset, summarize the changes succinctly in a way that is useful for people who are developers working in the repository or managers needing to keep up to date with progress. Do not repeat any changesets that may already be represented. Use one changeset file per topic.

## Process

1. **Compare changes**: Use `git diff --name-only main...HEAD` and `git log --oneline main...HEAD` to understand what has changed
2. **Review existing changesets**: Check `.changeset/` directory to avoid duplicating existing changesets
3. **Group related changes**: Organize changes by logical feature or component groups
4. **Create changeset files**: Write one markdown file per logical grouping with:
   - Front matter specifying affected packages and version bump type (patch, minor, major)
   - Clear, concise description of changes
   - Any relevant context for developers or managers

## Changeset Format

Each changeset file should follow this format:

```markdown
---
'@lsst-sqre/squared': minor
---

Brief title of the change

Detailed description explaining:

- What was changed
- Why it was changed
- Any impact on developers or users
```

## Version Bump Guidelines

- **patch**: Bug fixes, documentation updates, minor tweaks
- **minor**: New features, component additions, API additions (backwards compatible)
- **major**: DO NOT create major changes as we are currently in 0. versions where breaking changes are allowed. ~~Breaking changes, API removals, significant architecture changes~~
