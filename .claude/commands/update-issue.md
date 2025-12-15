---
description: Update an existing local issue plan.
argument-hint: "[issue-path] [update-prompt]"
---

# Update Issue Command

Update an existing local issue plan based on the user's prompt.

## User Request

$ARGUMENTS

The first argument should be the path to the issue file or directory. Remaining arguments are the update prompt.

## Process

### 1. Parse Arguments

Extract from `$ARGUMENTS`:

- **Path**: First argument - path to issue file (`.issues/YYYY-MM-slug.md`) or directory (`.issues/YYYY-MM-slug/`)
- **Update prompt**: Remaining arguments - what the user wants to change

If the path doesn't start with `.issues/`, prepend it.
If the path is a directory, the primary file is `00-parent.md`.

### 2. Read Existing Issue

Read the issue file(s) to understand:

- Current frontmatter (preserve `repo`, `issue`, `created`)
- Existing content structure
- For parent issues: all sub-issue files

### 3. Determine Update Scope

Based on the update prompt, determine what needs to change:

- **Content update**: Modify Research, Design, or Implementation sections
- **Structure change**: Convert simple → multi-phase (or vice versa)
- **Scope expansion**: Add new sub-issues
- **Scope reduction**: Remove or consolidate sub-issues

### 4. Apply Updates

Make the requested changes while:

- **Preserving frontmatter metadata**: Keep `repo`, `issue`, `created` unchanged
- **Updating timestamp**: Set `updated` to current time
- **Maintaining structure**: Keep the standard section format
- **Preserving issue numbers**: Don't lose GitHub issue references

### 5. Handle Structure Changes

**Converting simple issue → multi-phase project**:

1. Create new directory with same slug
2. Move existing content to `00-parent.md`
3. Add `sub_issues` array to frontmatter
4. Create new sub-issue files as specified
5. Add Contents section to parent

**Adding sub-issues to existing project**:

1. Create new numbered sub-issue file
2. Update parent's `sub_issues` array
3. Update parent's Contents section

**Removing sub-issues**:

1. If sub-issue has GitHub issue number, warn user (can't delete from GitHub)
2. Remove file from directory
3. Update parent's `sub_issues` array
4. Update parent's Contents section

### 6. Update Timestamps

Update the `updated` field in frontmatter:

```bash
date -u +"%Y-%m-%dT%H:%M:%SZ"
```

### 7. Report Results

After updating, inform the user:

- What was changed
- Path to modified file(s)
- If structure changed, explain the new layout
- Remind about `/sync-issue` if ready to push to GitHub

## Guidelines

- **Preserve existing data**: Don't lose GitHub issue numbers or creation timestamps
- **Maintain consistency**: Keep the same markdown structure
- **Warn about GitHub implications**: If removing content for synced issues, note that GitHub won't auto-update
- **Additional research**: If the update requires understanding new parts of the codebase, do the research
- **Ask for clarification**: If the update prompt is ambiguous, ask the user what they mean

## Example Updates

**User**: "Add a testing section to the implementation details"
→ Expand Implementation Details section with testing strategy

**User**: "Split this into three phases"
→ Convert from simple issue to directory with parent + 3 sub-issues

**User**: "Update the research section with what we learned about the auth system"
→ Revise Research section with new findings

**User**: "Add a label for security"
→ Add `security` to the `labels` array in frontmatter
