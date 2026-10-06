---
'@lsst-sqre/global-css': minor
---

New `dist/syntax.css` stylesheet with MicroLighter's GitHub syntax-highlighting theme, which colours `@lsst-sqre/squared`'s `CodeBlock`. The theme sets `--syntax-*` colour variables on `[data-syntax-theme="github"]` containers and adds global `::highlight()` rules for the token categories. Import it next to the base stylesheet wherever `CodeBlock` renders:

```js
import '@lsst-sqre/global-css/dist/next.css';
import '@lsst-sqre/global-css/dist/syntax.css';
```

`dist/syntax.css` is a separate entry, built with the same Lightning CSS targets as `dist/next.css`, rather than part of the base stylesheet. Next.js 16.3's Turbopack bundles an older Lightning CSS that doesn't recognize the `::highlight()` pseudo-element, so `next dev` and `next build` log a "Parsing CSS source code failed" warning for `dist/syntax.css`; Turbopack's error recovery keeps the rules, so highlighting works in both `next dev` and production builds. Keeping the theme in its own stylesheet means a parse failure there can only affect syntax highlighting, never the reset, design tokens, and base styles in `dist/next.css`.
