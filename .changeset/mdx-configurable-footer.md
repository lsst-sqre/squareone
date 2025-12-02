---
"squareone": minor
---

Add MDX-configurable footer

The page footer can now be customized using MDX content. This enables deployments to customize footer content (contact information, legal notices, institutional links) without code changes. The new `footerMdxPath` configuration sets the path to the footer MDX file relative to `mdxDir` (defaults to `footer.mdx`).
