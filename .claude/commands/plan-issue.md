---
description: Create a new local issue plan.
argument-hint: "[prompt]"
---

# Plan Issue Command

Create a new local issue plan based on the user's prompt.

## User Request

$ARGUMENTS

## Process

### 1. Detect Repository

Get the repository from git remote:

```bash
git remote get-url origin | sed 's/.*github.com[:/]\(.*\)\.git/\1/'
```

### 2. Research the Codebase

Based on the user's prompt, thoroughly research the codebase to understand:

- Current state of relevant code
- Existing patterns and conventions
- Dependencies and constraints
- Files that will need modification

Use the Explore agent or search tools to gather this context. Be thorough - good research leads to better plans.

### 3. Analyze Scope

Determine if this is:

- **Simple issue**: Single PR, straightforward implementation → create single `.md` file
- **Multi-phase project**: Multiple PRs, complex implementation, parallelizable work → create directory with parent and sub-issues

### 4. Generate Filename

Create the filename using:

- Date prefix: Current year and month (`YYYY-MM-`)
- Slug: Derived from the project title, lowercase, hyphens for spaces
- Example: `2025-01-user-authentication.md` or `2025-01-api-migration/`

### 5. Create Issue File(s)

**For simple issues**, create a single file at `.issues/YYYY-MM-slug.md`:

```markdown
---
repo: <detected-repo>
issue: null
state: draft
labels:
  - <appropriate-labels>
created: <current-timestamp>
updated: <current-timestamp>
---

# <Title>

<High-level description of the issue>

## Research

<Document your findings from codebase research>
- Current state analysis
- Relevant file paths
- Dependencies identified
- Constraints discovered

## Proposed Design

<Describe the design approach>
- Architecture decisions
- Key changes needed
- Trade-offs considered

## Implementation Details

<Step-by-step implementation approach>
- Specific changes to make
- Files to modify
- Testing strategy
- Acceptance criteria
```

**For multi-phase projects**, create a directory at `.issues/YYYY-MM-slug/`:

1. Create `00-parent.md` with overview and Contents section
2. Create numbered sub-issue files (`01-*.md`, `02-*.md`, etc.)
3. Each sub-issue follows the same structure as simple issues
4. Parent's frontmatter includes `sub_issues` array listing all sub-issue files

### 6. Report Results

After creating the file(s), inform the user:

- Path to created file(s)
- Summary of the plan
- Next steps (iterate with `/update-issue` or sync with `/sync-issue`)

## Guidelines

- **Be thorough in research**: The quality of the plan depends on understanding the codebase
- **Include specific file paths**: Reference actual files in the Research section
- **Keep implementation actionable**: Each step should be clear enough to execute
- **Choose appropriate labels**: Common labels include `enhancement`, `bug`, `documentation`, `refactor`
- **Break down complex work**: If implementation requires more than one PR, use sub-issues
- **Consider dependencies**: Order sub-issues so dependencies are addressed first

## Timestamps

Use ISO 8601 format with timezone: `YYYY-MM-DDTHH:mm:ssZ`

Get current timestamp:

```bash
date -u +"%Y-%m-%dT%H:%M:%SZ"
```
