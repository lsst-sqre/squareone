---
'@lsst-sqre/squared': minor
---

Migrate components from styled-components to CSS Modules

Migrated the IconPill and PrimaryNavigation components from styled-components to CSS Modules for better performance and smaller bundle size. This change:

- Removes the styled-components dependency from the squared package
- Improves build-time CSS processing
- Maintains all existing styling and functionality
- Adds CSS Module type definitions for TypeScript support