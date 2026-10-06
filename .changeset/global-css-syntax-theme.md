---
'@lsst-sqre/global-css': minor
---

The global stylesheet now includes MicroLighter's GitHub syntax-highlighting theme, which colours `@lsst-sqre/squared`'s `CodeBlock`. The theme sets `--syntax-*` colour variables on `[data-syntax-theme="github"]` containers and adds global `::highlight()` rules for the token categories. Next.js 16.3's Turbopack logs a "Parsing CSS source code failed" warning for those `::highlight()` rules because its bundled Lightning CSS doesn't recognize the pseudo-element, but it keeps the rules, so highlighting works in both `next dev` and production builds.
