---
'squareone': patch
---

Update remark from 14 to 15, remark-gfm from 3 to 4, and remark-html from 15 to 16. The Markdown-to-HTML pipelines behind broadcast banners, notification summaries, and the compose preview are unchanged in behavior, and `remark-html` still sanitizes by default. The bump moves these packages onto unified 11, the same core `next-mdx-remote` and `@mdx-js/mdx` already use, so the dependency tree no longer carries a second copy of the unified and micromark stack.
