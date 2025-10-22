---
'squareone': minor
---

Add MDX content support to Account settings page

The Account settings page (`/settings`) now uses MDX for its content instead of hardcoded placeholder text. This enables deployments to customize account management instructions and external links via ConfigMaps.

Key changes:

- Account page loads content from `settings__index.mdx` using the existing MDX content system
- Includes error handling with fallback content when MDX file is unavailable
- Default content includes sections for account management, identity providers, and personal information
- Uses `Lede` and `CtaLink` components for consistent styling
- Deployments can provide custom MDX files via `mdxDir` configuration to include deployment-specific URLs and instructions for their account management systems (COManage, etc.)
