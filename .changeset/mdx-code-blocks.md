---
'squareone': minor
---

Fenced code blocks in MDX content are now syntax highlighted. A block that names its language, such as ```` ```python ```` or ```` ```json ````, renders through the `CodeBlock` component from `@lsst-sqre/squared`, with a button that copies the code. This applies to every RSC-compiled MDX page (`/docs`, `/support`, `/api-aspect`, `/settings`, and the enrollment pages), including the MDX that Phalanx mounts for each environment. Highlighting happens in the browser, so the server-rendered page and browsers without the CSS Custom Highlight API show the code as plain monospace text. A fenced block without a language, and any other `<pre>`, renders as a plain preformatted block as before.

The development `/api-aspect` content now includes a Python example of querying the TAP service with pyvo.
