# Claude Code Configuration

This directory contains configuration for Claude Code, including specialized skills that provide domain-specific expertise for working with this monorepo.

## Directory Structure

```
.claude/
├── agents/                     # Specialized agents
│   └── test-suite-runner.md   # CI pipeline execution agent
├── commands/                   # Simple procedural commands
│   └── create-changesets.md   # Changeset creation workflow
├── skills/                     # Domain expertise skills
│   ├── appconfig-system/       # AppConfig runtime configuration
│   ├── turborepo-workflow/     # Build orchestration & caching
│   ├── squared-package/        # Component library architecture
│   ├── design-system/          # CSS variables & design tokens
│   ├── component-creation/     # React component development
│   ├── testing-infrastructure/ # Testing patterns & tools
│   ├── times-square-integration/ # Times Square notebook system
│   ├── data-fetching-patterns/ # SWR data fetching patterns
│   ├── migrate-styled-components-to-css-modules/ # Migration guide
│   └── platform-api-integration/ # RSP API discovery & integration
├── tasks/                      # Gitignored task-specific docs
├── projects/                   # Project-specific configurations
├── settings.local.json         # Local settings & permissions
└── README.md                   # This file
```

## Skills System

### What are Skills?

Skills are modular capabilities that extend Claude's expertise with domain-specific knowledge. Each skill is a directory containing:

- **SKILL.md** - Main expertise with YAML frontmatter
- **Supporting files** - Templates, examples, reference docs
- **Scripts** (optional) - Executable utilities

### How Skills Work

**Progressive Disclosure:**

1. **Level 1**: Metadata (name, description) always loaded
2. **Level 2**: SKILL.md content loaded when triggered
3. **Level 3**: Supporting files loaded as needed

**Automatic Activation:** Claude automatically loads skills when your request matches the skill's description.

### Available Skills

#### appconfig-system

**When to use**: Configuration loading, YAML config files, `getServerSideProps` setup, MDX content, Sentry config injection, migrating from `next/config`

**Covers**:

- Server-side `loadAppConfig()` patterns
- Client-side `useAppConfig()` hook
- MDX content loading
- Sentry configuration injection
- Kubernetes ConfigMap deployment

**Supporting files**:

- Templates for pages and components
- Config reference documentation
- Example YAML files and schemas

#### turborepo-workflow

**When to use**: Build commands, caching issues, monorepo task execution, CI/CD pipelines, pnpm scripts

**Covers**:

- Critical rule: Always use root-level pnpm scripts
- Remote cache authentication (1Password, .env, env vars)
- Filter syntax for targeting packages
- Troubleshooting build and cache issues

**Supporting files**:

- `turbo-wrapper.js` authentication script
- Remote cache documentation
- Command reference guide

#### squared-package

**When to use**: Working on squared components, build/transpilation issues, app integration

**Covers**:

- NO BUILD STEP architecture
- CSS Modules-only styling requirement
- Next.js transpilation configuration
- Vitest testing infrastructure

**Supporting files**:

- package.json and vitest.config.ts
- Consuming app setup guide
- Styled-components migration guide

#### design-system

**When to use**: Styling components, referencing CSS variables, understanding design tokens, working with colors, spacing, typography, or other design primitives

**Covers**:

- Complete CSS custom property reference
- Rubin Style Dictionary foundation tokens (--rsd-\* prefix)
- Squareone application tokens (--sqo-\* prefix)
- Color scales (primary, blue, green, red, orange, yellow, purple, gray)
- Semantic component colors
- Spacing (responsive and fixed)
- Elevations (shadows)
- Border radius
- Asset paths (logos, watermarks)
- Dark mode/theming patterns
- Design token sources and modification

**Supporting files**:

- None (references actual CSS files in packages/)

#### component-creation

**When to use**: Creating new components, component structure, CSS Modules styling, Storybook stories, tests

**Covers**:

- TypeScript patterns (type vs interface, no React.FC)
- CSS Modules with design tokens
- Storybook story patterns
- Component testing patterns
- Compound components

**Supporting files**:

- Component templates (simple & compound)
- Styling guide
- Testing guide
- Storybook guide

#### testing-infrastructure

**When to use**: Writing tests, test configuration, troubleshooting test failures, CI pipeline

**Covers**:

- Vitest configuration (unit & Storybook tests)
- React Testing Library patterns
- Mock data setup
- Story tests with addon-vitest
- test-suite-runner agent usage

**Supporting files**:

- Test examples (unit & story)
- Mock data patterns
- Vitest configuration reference

#### times-square-integration

**When to use**: Times Square pages, SSE updates, URL parameters, GitHub PR previews, Times Square API

**Covers**:

- Context providers (URL parameters, HTML events)
- Custom data fetching hooks
- Mock API endpoints for development
- Page routing patterns
- Real-time SSE integration

**Supporting files**:

- Context usage examples
- Hook patterns
- API mock setup guide

#### data-fetching-patterns

**When to use**: API interactions, custom hooks, loading/error states, mock data

**Covers**:

- SWR configuration and patterns
- Custom hook patterns (useUserInfo, useTimesSquarePage)
- Error handling
- Mutations and optimistic updates
- Pagination and infinite loading

**Supporting files**:

- Hook templates
- Error handling patterns
- Mock data setup

#### migrate-styled-components-to-css-modules

**When to use**: Converting styled-components to CSS Modules, refactoring legacy styled code, modernizing component styling, preparing squared components for NO BUILD STEP

**Covers**:

- Step-by-step component conversion
- Design token replacement
- Dynamic styles (data attributes, conditional classes)
- Test updates
- Compound component migration
- Both squared package (required) and squareone app (optional) patterns

**Supporting files**:

- Component template with comprehensive patterns
- Before/after examples
- Migration checklist

#### platform-api-integration

**When to use**: Working with RSP platform APIs, finding API documentation, discovering endpoints, implementing new API integrations, creating TypeScript types from schemas, setting up authentication

**Covers**:

- OpenAPI specification locations (Gafaelfawr, Times Square, other RSP services)
- Using WebFetch to download and explore OpenAPI specs
- Creating TypeScript types from API schemas
- SWR-based integration patterns
- Authentication patterns (CSRF tokens for Gafaelfawr, cookies for Times Square)
- Pagination and polling patterns
- Mock API development workflow

**Supporting files**:

- API registry with OpenAPI spec URLs
- Hook template for new endpoints
- Integration patterns and examples

## Agents

### test-suite-runner

Specialized agent for executing the full CI pipeline and analyzing failures.

**Use via Task tool:**

```typescript
// Claude automatically uses this for comprehensive testing
```

**Covers**:

- Running `pnpm run localci`
- Analyzing failures across all stages
- Formatting, linting, type-checking, testing, building
- Detailed failure reports with suggestions

## Commands

### create-changesets

Simple procedural workflow for creating changesets.

**Covers**:

- Comparing branch changes
- Reviewing existing changesets
- Creating logical groupings
- Writing clear changeset descriptions

## Using Skills

### Automatic Usage

Skills activate automatically when relevant. Simply describe what you want:

- "Set up configuration loading for a new page" → `appconfig-system`
- "Create a new component with CSS Modules" → `component-creation`
- "What CSS variables are available for colors?" → `design-system`
- "Why is my build slow?" → `turborepo-workflow`
- "Write tests for my component" → `testing-infrastructure`
- "Find the API documentation for Gafaelfawr" → `platform-api-integration`

### Manual Reference

Refer to skills explicitly:

- "Follow the appconfig-system pattern for this page"
- "Use component-creation templates to scaffold this"
- "Apply data-fetching-patterns for this API call"

## Maintaining Skills

### Adding New Skills

1. Create directory in `.claude/skills/`
2. Create `SKILL.md` with YAML frontmatter
3. Add supporting files (templates, examples, docs)
4. Update this README

**SKILL.md frontmatter:**

```yaml
---
name: skill-name
description: What the skill does and when to use it. Include trigger words and use cases.
---
```

**Description best practices:**

- Include **what** the skill covers
- Include **when** to use it (trigger scenarios)
- Use clear **keywords** for matching

### Updating Skills

- Edit SKILL.md directly
- Add/update supporting files as needed
- No rebuild or restart required
- Changes take effect immediately

### Skill Organization

**Do:**

- One skill per domain/topic
- Include working examples and templates
- Use progressive disclosure (SKILL.md → details)
- Reference repository files by path (not copies)
- Copy only templates and skill-specific guides

**Don't:**

- Create overlapping skills
- Duplicate content across skills
- Make skills too broad or too narrow
- Include outdated information
- Copy source files from the repository (reference them instead)

### When to Copy vs. Reference Files

**✅ Copy into skill (create new files):**

- **Templates** - Example files for users to copy (e.g., `component.module.css` template)
- **Guides** - Documentation unique to the skill (e.g., `consuming-app-setup.md`)
- **Examples** - Illustrative code showing patterns (e.g., before/after examples)

**✅ Reference by path (don't copy):**

- **Source files** - Actual code from the repository (e.g., `packages/squared/package.json`)
- **Configuration files** - Real config files (e.g., `apps/squareone/squareone.config.yaml`)
- **Documentation** - Existing docs (e.g., `docs/dev/remote-cache.rst`)

**Why:** Claude can read any file in the repository when a skill is active. Referencing files ensures skills always show current code without maintenance burden.

**Example:**

```markdown
<!-- ✅ Good: Reference repository file -->

See the actual package configuration at `packages/squared/package.json`.

<!-- ❌ Bad: Copy file into skill -->

See [package.json](package.json) for complete configuration. [Copy of package.json in skill directory - gets stale!]
```

## Settings and Permissions

### settings.local.json

Contains local settings including:

- Tool permissions (pre-approved commands)
- Agent configurations
- Custom preferences

**Note**: This file is gitignored (user-specific).

## Tasks Directory

The `tasks/` directory (gitignored) is for:

- Task-specific planning docs
- Design documents
- Debugging notes
- User-specific context

Not part of the persistent skill system.

## Best Practices

### For Users

1. **Let skills activate automatically** - Describe what you need naturally
2. **Reference skills explicitly** when needed - "Use appconfig-system pattern"
3. **Report issues** with skills if they're outdated or incorrect
4. **Suggest new skills** for recurring patterns

### For Contributors

1. **Update skills** when architecture changes
2. **Add examples** from real code
3. **Test skill triggers** - Ensure descriptions match use cases
4. **Keep skills focused** - One responsibility per skill
5. **Document supporting files** - Explain what each file is for

## Relationship to CLAUDE.md

**CLAUDE.md**: High-level guide with essential context (always loaded)

**Skills**: Deep domain expertise loaded on-demand

**Division:**

- **CLAUDE.md**: Repository overview, architecture summary, commands reference
- **Skills**: Detailed patterns, templates, troubleshooting, step-by-step guides

## Troubleshooting

### Skill Not Triggering

- Check description includes relevant keywords
- Try explicit reference: "Use [skill-name] skill"
- Verify SKILL.md frontmatter is valid YAML

### Skill Information Outdated

- Update SKILL.md directly
- Update supporting files
- Changes effective immediately

### Need New Skill

1. Identify the domain/topic
2. Create skill directory structure
3. Write SKILL.md with comprehensive frontmatter description
4. Add templates and examples
5. Test by requesting tasks that should trigger it

## Additional Resources

- **Anthropic Skills Documentation**: https://docs.anthropic.com/en/docs/agents-and-tools/agent-skills
- **CLAUDE.md**: Repository-level guidance
- **.github/copilot-instructions.md**: Additional coding patterns

## Contributing

When making changes that affect skills:

1. **Update relevant skills** - Don't let them become stale
2. **Add examples** - Real code is better than descriptions
3. **Test triggers** - Ensure skill activates appropriately
4. **Update this README** - Keep directory documentation current

## Questions?

- Check CLAUDE.md for high-level guidance
- Reference specific skills for detailed patterns
- Ask Claude directly - skills activate automatically!
