---
'squareone': patch
---

The app now loads `CodeBlock`'s syntax-highlighting colours from `@lsst-sqre/global-css/dist/syntax.css`, next to the base `dist/next.css` stylesheet, and `pnpm build` checks that they ship. After `next build`, `scripts/check-syntax-css.js` scans the emitted `.next/static/**/*.css` and fails the build with an explanation if no stylesheet contains a `::highlight(` rule. Turbopack logs a "Parsing CSS source code failed" warning for those rules and keeps them only through its error recovery, so without this check a change in that recovery would ship uncoloured code blocks with a green build. CI's build step and the Docker image build both run the check.
