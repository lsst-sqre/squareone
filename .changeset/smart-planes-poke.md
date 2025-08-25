---
'squareone': minor
---

Resolved server-side rendering (SSR) issues that were exposed by the TypeScript migration and new tree shaking:

- Improved next-mdx-remote usage by ensuring that the `serialize` function is called from `getServerSideProps`.
- Improved swr usage by segreagating it into client-side components that are dynamically imported.
