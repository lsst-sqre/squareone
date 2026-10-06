---
'squareone': patch
---

Fenced code blocks in the footer MDX (`footer.mdx`, which Phalanx mounts for each environment) are now syntax highlighted with a copy button, like those on the other MDX pages. Previously the footer's component registry missed the `CodeBlock` mapping, so a block such as ```` ```bash ```` in the footer rendered as a plain preformatted block.
