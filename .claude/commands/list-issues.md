---
description: List local issue plans and their status.
model: claude-haiku-4-5
---

# List Issues Command

List all local issue plans with their status.

## Process

### 1. Scan .issues Directory

Find all issue files and directories in `.issues/`:

```bash
ls -1 .issues/
```

- Files ending in `.md` are simple issues
- Directories contain multi-phase projects

### 2. Parse Each Issue

For each item found:

**Simple issues** (`.md` files):

- Read the file
- Parse YAML frontmatter
- Extract H1 title from content

**Multi-phase projects** (directories):

- Read `00-parent.md`
- Parse frontmatter (including `sub_issues` array)
- Extract H1 title
- Count sub-issues

### 3. Collect Information

For each issue, gather:

- **Path**: File or directory path
- **Title**: From H1 heading
- **Issue #**: From frontmatter `issue` field (or "draft")
- **State**: From frontmatter `state` field
- **Labels**: From frontmatter `labels` array
- **Sub-issues**: Count of sub-issues (for multi-phase)
- **Updated**: From frontmatter `updated` field

### 4. Display Results

Format as a table:

```
Local Issue Plans
=================

| Path                          | Title                    | Issue  | State  | Labels              | Updated    |
|-------------------------------|--------------------------|--------|--------|---------------------|------------|
| 2025-01-user-auth.md          | User Authentication      | #123   | open   | enhancement         | 2025-01-15 |
| 2025-01-api-migration/        | API v2 Migration (3 sub) | #124   | open   | epic, breaking      | 2025-01-14 |
| 2025-01-bug-fix.md            | Fix login redirect       | draft  | draft  | bug                 | 2025-01-13 |

Total: 3 issues (2 synced, 1 draft)
```

### 5. Handle Empty Directory

If no issues found:

```
No local issue plans found.

Create a new issue plan with:
  /plan-issue <description of the project>
```

## Output Format Guidelines

- **Sort by**: Updated date (most recent first)
- **Truncate titles**: If longer than 25 characters, truncate with "..."
- **Format dates**: Show as YYYY-MM-DD for readability
- **Multi-phase indicator**: Show "(N sub)" suffix for directories
- **Labels**: Show first 2-3 labels, add "..." if more

## Optional Filters

If the user provides arguments, filter results:

- `/list-issues draft` - Show only draft issues
- `/list-issues open` - Show only open issues
- `/list-issues closed` - Show only closed issues

## Example Output Variations

### With Sub-issues Expanded

```
2025-01-api-migration/ - API v2 Migration (#124, open)
  ├── 01-deprecate-v1.md - Deprecate V1 endpoints (#125, open)
  ├── 02-implement-v2.md - Implement V2 API (#126, open)
  └── 03-remove-v1.md - Remove V1 code (draft)
```

### Compact Summary

```
3 local issues: 2 synced, 1 draft
- 2 open, 0 closed
- Labels: enhancement (1), epic (1), bug (1)
```

## Guidelines

- **Keep output scannable**: Use consistent formatting
- **Show actionable info**: Highlight drafts that need syncing
- **Handle errors gracefully**: If a file can't be parsed, note it but continue
