---
"@lsst-sqre/times-square-client": minor
---

Add direct URL support to useHtmlStatus hook

The `useHtmlStatus` hook now accepts a `htmlStatusUrl` option that allows using a pre-fetched URL directly, rather than building the URL from a page name:

```typescript
const { htmlStatusUrl } = useTimesSquarePage(githubSlug, { repertoireUrl });
const { htmlAvailable, htmlUrl } = useHtmlStatus('', params, { htmlStatusUrl });
```

This enables efficient usage patterns where page metadata is already fetched and the HTML status URL can be passed directly. Also adds `fetchHtmlStatusByUrl` and `htmlStatusUrlQueryOptions` for direct URL-based queries.
