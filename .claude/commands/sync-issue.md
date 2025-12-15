---
description: Synchronize local issue plans with GitHub.
argument-hint: "[issue-path]"
---

# Sync Issue Command

Synchronize a local issue plan with GitHub. Handles both creating new issues and updating existing ones.

## User Request

$ARGUMENTS

The argument should be the path to the issue file or directory.

## Process

### 1. Parse Arguments

Extract the path from `$ARGUMENTS`:

- If path doesn't start with `.issues/`, prepend it
- If path is a directory, primary file is `00-parent.md`
- Identify if this is a simple issue or multi-phase project

### 2. Read Local Issue(s)

Read all relevant files:

- For simple issue: single `.md` file
- For multi-phase: `00-parent.md` and all sub-issue files listed in `sub_issues`

Parse frontmatter to get:

- `repo`: GitHub repository
- `issue`: Issue number (null if draft)
- `state`: Current state
- `labels`: Labels to apply
- `sub_issues`: List of sub-issue files (for parent)

### 3. Check GitHub Authentication

Verify `gh` CLI is authenticated:

```bash
gh auth status
```

If not authenticated, inform user to run `gh auth login`.

### 4. Determine Sync Action

**For each issue file, determine status**:

| Local State         | GitHub State | Action           |
| ------------------- | ------------ | ---------------- |
| draft (issue: null) | N/A          | Create new issue |
| open/closed         | Issue exists | Compare and sync |

### 5. Handle Draft Issues (Create New)

For issues with `issue: null`:

1. **Build issue body** from markdown content:

   - Use title from H1 heading
   - Include Research, Proposed Design, Implementation Details sections
   - For sub-issues: Add "Part of #X" linking to parent

2. **Create GitHub issue**:

   ```bash
   gh issue create \
     --repo <repo> \
     --title "<title>" \
     --body "<body>" \
     --label "<labels>"
   ```

3. **Update frontmatter**:

   - Set `issue` to returned issue number
   - Set `state` to `open`
   - Update `updated` timestamp

4. **For parent issues with sub-issues**:
   - Create sub-issues first (to get their numbers)
   - Then create parent with links to sub-issues
   - Update parent's Contents section with issue numbers

### 6. Handle Existing Issues (Compare and Sync)

For issues with an issue number:

1. **Fetch GitHub state**:

   ```bash
   gh issue view <number> --repo <repo> --json title,body,state,labels
   ```

2. **Compare local vs remote**:

   - Title (H1 heading vs GitHub title)
   - Body content
   - State (open/closed)
   - Labels

3. **If different, show diff and ask user**:

   ```
   Differences found for issue #123:

   Title:
   - Local: "New authentication system"
   - GitHub: "Authentication system redesign"

   Body: [differs - showing first 500 chars]
   Local: ...
   GitHub: ...

   State:
   - Local: open
   - GitHub: closed

   What would you like to do?
   1. Push local → GitHub (overwrite remote)
   2. Pull GitHub → local (overwrite local)
   3. Skip this issue
   ```

4. **Execute chosen action**:

   **Push (local → GitHub)**:

   ```bash
   gh issue edit <number> --repo <repo> \
     --title "<title>" \
     --body "<body>"
   ```

   Update labels if needed:

   ```bash
   gh issue edit <number> --repo <repo> --add-label "<new-labels>"
   gh issue edit <number> --repo <repo> --remove-label "<removed-labels>"
   ```

   **Pull (GitHub → local)**:

   - Update markdown content from GitHub body
   - Update `state` from GitHub
   - Update `labels` from GitHub
   - Update `updated` timestamp

### 7. Handle Multi-Phase Projects

For directories with parent and sub-issues:

1. **Collect all files** from `sub_issues` array
2. **Check each file** for changes (compare local vs GitHub)
3. **Present summary**:

   ```
   Sync status for 2025-01-api-migration:

   00-parent.md (#123): No changes
   01-deprecate-v1.md (#124): Local changes (Research section updated)
   02-implement-v2.md (#125): GitHub changes (State changed to closed)
   03-remove-v1.md: Draft (not yet on GitHub)

   Which files would you like to sync?
   1. All files
   2. Only drafts (create new)
   3. Only changed files
   4. Select specific files
   5. Skip all
   ```

4. **Process selected files** according to user choice

### 8. Update Parent Links

After syncing sub-issues, update parent's Contents section with issue numbers:

```markdown
## Contents

Links to sub-issues in execution order:

1. [Deprecate V1 endpoints](./01-deprecate-v1.md) - #124
2. [Implement V2 API](./02-implement-v2.md) - #125
3. [Remove V1 code](./03-remove-v1.md) - #126
```

### 9. Report Results

Summarize what was done:

- Issues created (with numbers)
- Issues updated
- Issues skipped
- Any errors encountered

## GitHub CLI Reference

### Create Issue

```bash
gh issue create --repo org/repo --title "Title" --body "Body" --label "label1,label2"
```

### View Issue (JSON)

```bash
gh issue view 123 --repo org/repo --json title,body,state,labels
```

### Edit Issue

```bash
gh issue edit 123 --repo org/repo --title "Title" --body "Body"
```

### Manage Labels

```bash
gh issue edit 123 --repo org/repo --add-label "label1" --remove-label "label2"
```

### Close/Reopen

```bash
gh issue close 123 --repo org/repo
gh issue reopen 123 --repo org/repo
```

## Building Issue Body from Markdown

When creating/updating GitHub issues, construct the body from the markdown:

1. **Skip the H1 title** (becomes the issue title)
2. **Include all sections**: Research, Proposed Design, Implementation Details
3. **For sub-issues**: Prepend "Part of #X\n\n" to link to parent
4. **For parent issues**: Ensure Contents section has issue numbers

## Error Handling

- **Network errors**: Inform user and suggest retry
- **Permission errors**: Check repo access
- **Rate limiting**: Wait and retry, or inform user
- **Invalid issue numbers**: Issue may have been deleted; offer to create new

## Guidelines

- **Always confirm before overwriting**: Show diff and ask user
- **Preserve local changes by default**: Don't auto-pull without asking
- **Handle partial failures gracefully**: If one sub-issue fails, continue with others
- **Update timestamps**: Always update `updated` field after sync
