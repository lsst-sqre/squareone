---
description: Set up context for working on a local issue plan.
argument-hint: "[issue-path] [prompt]"
---

# Work Issue Command

Set up the context for working on a local issue plan. Reads the issue file and its parent (if applicable), presents the context, and passes through the user's prompt.

## User Request

$ARGUMENTS

The first argument is the issue path. Remaining arguments form the work prompt.

## Process

### 1. Parse Arguments

Extract from `$ARGUMENTS`:

- **Issue path**: First argument (e.g., `01-rsc-foundation.md` or `2025-12-rsc-app-config/01-rsc-foundation.md`)
- **Work prompt**: Everything after the issue path

Path normalization:

- If path doesn't include `.issues/`, prepend `.issues/`
- If path is just a filename like `01-foo.md`, search in `.issues/` subdirectories
- Support both `dirname/filename.md` and full path formats

### 2. Locate Issue Files

Find the issue file and determine context:

**For sub-issues** (files starting with `01-`, `02-`, etc.):

- Read the specified issue file
- Look for `00-parent.md` in the same directory
- If parent exists, read it for overall project context

**For parent issues** (`00-parent.md`):

- Read the parent file
- Note the `sub_issues` array from frontmatter
- Present overview of all phases

**For simple issues** (single file, not in a directory):

- Read just that file

### 3. Read Issue Content

For each relevant file, extract:

- **Frontmatter**: repo, issue number, state, labels
- **Title**: From H1 heading
- **Sections**: Research, Proposed Design, Implementation Details

### 4. Present Work Session Context

Format the context summary:

```
## Working on: [Issue Title]

**File**: .issues/path/to/issue.md
**GitHub**: #123 (https://github.com/org/repo/issues/123) [or "Not synced (draft)"]
**State**: open/draft/closed

[If sub-issue:]
**Parent**: [Parent Title] (#456)
**Phase**: 1 of 6

[If parent:]
**Sub-issues**: 6 phases
- #346 Phase 1: RSC Foundation [open]
- #347 Phase 2: Service Discovery [open]
...

---

[Include full issue content for reference]

---

## Your Request

[User's work prompt from arguments]
```

### 5. Pass Through Work Prompt

After presenting the context, acknowledge the user's work prompt and proceed with whatever they requested:

- If they want to implement, begin implementation
- If they want to update the plan, enter plan mode
- If they want to review, analyze the issue
- If no prompt provided, ask what they'd like to do

## Guidelines

- **Read-only by default**: This command only sets up context; it doesn't modify files
- **Always show GitHub link**: If issue is synced, make it easy to reference
- **Include parent context**: Sub-issues make more sense with parent overview
- **Preserve user intent**: The work prompt drives what happens next
- **Handle missing files gracefully**: If file not found, list available issues
