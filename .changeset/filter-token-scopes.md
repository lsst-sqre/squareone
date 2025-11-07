---
'squareone': patch
---

Filter available scopes in token creation form based on user's authentication token

The token creation form now filters the available scopes to only show scopes that the user's current authentication token possesses. This prevents users from attempting to create tokens with scopes they don't have access to, providing a better user experience and clearer security boundaries. Changes:

- Modified `/settings/tokens/new` page to filter `loginInfo.config.scopes` by `loginInfo.scopes`
- Updated NewTokenPage Storybook story to match implementation and added a new `LimitedScopes` story demonstrating the filtering behavior
