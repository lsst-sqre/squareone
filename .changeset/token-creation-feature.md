---
'squareone': minor
---

Add comprehensive token creation workflow

Implements a full-featured token creation system including:

- New `/settings/tokens/new` page with form interface
- Token name validation to prevent duplicates
- Scope selection with configurable available scopes
- Flexible expiration options (preset durations and custom dates)
- Query parameter support for pre-filling form values from URL templates
- Integration with Gafaelfawr token API for token creation
- Success modal displaying newly created tokens with copy functionality
- Enhanced navigation with "Access Tokens" link in settings

This feature enables users to create personal access tokens with appropriate scopes and expiration settings through a guided interface.