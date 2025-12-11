---
"squareone": patch
---

Migrate to modern next/Link behavior

Removed the `legacyBehavior` prop from Next.js Link components across the application. This is part of the Next.js 15 upgrade to use the modern Link API.

**Components updated:**

- `HeaderNav` - Internal navigation trigger links
- `TimesSquareGitHubNav/Page` - Page links in the GitHub navigation sidebar

**Changes:**

- Removed `legacyBehavior` and `passHref` props from Link components
- Updated `InternalTriggerLink` to use `PrimaryNavigation.TriggerLink` with `asChild` pattern, passing the `active` state to support active link styling
