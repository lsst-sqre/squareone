---
applyTo: "apps/squareone/\*\*"
---

# Times Square development guidelines

### Times Square specific patterns

- Use [`TimesSquareUrlParametersContext`](../../apps/squareone/src/components/TimesSquareUrlParametersProvider) for URL-based state
- Use [`TimesSquareHtmlEventsContext`](../../apps/squareone/src/components/TimesSquareHtmlEventsProvider) for real-time SSE updates
- Follow the existing patterns for GitHub navigation components
- Use MDX for configurable page content

### Mocking API endpoints

- Use mock API endpoints in `/pages/api/dev/times-square/` for development

### GitHub PR previews

- Times Square supports GitHub PR preview pages at `/times-square/github-pr/:owner/:repo/:commit` paths
