---
'squareone': patch
---

Simplify user menu to show only Settings and Log out

The user menu has been streamlined to display only two essential items:
- **Settings** - Links to `/settings` page for all account and token management
- **Log out** - Logs user out with proper redirect handling

This change removes the conditional external "Account settings" link and consolidates the "Access tokens" link into a general "Settings" link. All settings pages remain accessible through the sidebar navigation at `/settings`, including:
- Account settings (`/settings`)
- Access tokens (`/settings/tokens`)
- Sessions (`/settings/sessions`)

This simplification improves the user experience by reducing menu clutter while maintaining full access to all functionality through the settings section.
