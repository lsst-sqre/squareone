---
'squareone': minor
---

Add token viewing and deletion functionality

Implements comprehensive token management capabilities including:

- New AccessTokensView component displaying user's existing tokens
- AccessTokenItem component with semantic HTML time elements for dates
- Token deletion workflow with confirmation modal
- useDeleteToken hook for API integration with Gafaelfawr
- Date formatting utilities with relative time display
- Integration into `/settings/tokens` page alongside token creation
- Proper handling of undefined/null token fields from API

Users can now view their existing access tokens, see expiration and last-used dates, and delete tokens through a confirmation workflow. The interface provides clear visual feedback and follows the application's design system.
