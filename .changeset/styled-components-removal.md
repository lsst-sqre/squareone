---
"squareone": patch
---

Remove styled-components dependency from squareone

This completes the CSS Modules migration by removing all styled-components configuration, dependencies, and documentation references from the monorepo.

**Code Changes**

- Remove `ServerStyleSheet` SSR configuration from `_document.tsx` (Sentry config injection retained)
- Remove `styledComponents: true` compiler option from `next.config.js`
- Remove styled-components module declaration from `src/types/index.d.ts`
- Remove `styled-components` and `@types/styled-components` dependencies from package.json

**Documentation Updates**

- Update CLAUDE.md, README.md, and `.github/copilot-instructions.md` to reflect CSS Modules as the standard styling approach
- Remove styled-components RST reference from docs epilog

**Development Tooling**

- Remove styled-components VS Code extension from `.devcontainer/devcontainer.json`
- Update Storybook decorator comment (GlobalStyles is CSS-based, not styled-components)

All styling in both the squared package and squareone app now uses CSS Modules.
