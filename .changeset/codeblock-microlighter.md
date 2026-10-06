---
'@lsst-sqre/squared': minor
---

New `CodeBlock` component for syntax-highlighted source code, and the standard way to highlight code in Squareone apps. It wraps [MicroLighter](https://github.com/davatron5000/microlighter), which colours plain `<pre><code>` text with the CSS Custom Highlight API and lazy-loads one grammar per language, so pages carry no token markup and no grammars they don't use. Pass `code` and `language` (such as `json`, `yaml`, `python`, or `bash`); `lineNumbers` adds a line-number gutter, `copy` (on by default) adds a button that copies the code without the line numbers, and `ariaLabel` names the block for assistive technology.

`CodeBlock` is a client component that registers MicroLighter's `<micro-lighter>` element in the browser after hydration. Server rendering, and browsers without the Custom Highlight API (Chrome before 105, Safari before 17.2, Firefox before 140), show the code as plain monospace text. Colours come from MicroLighter's GitHub theme, which `@lsst-sqre/global-css` now provides, and follow the site's light or dark theme (`data-theme`) rather than the operating system's preference. Long lines scroll horizontally, and the code is keyboard-focusable so the scroll is reachable without a mouse.

MicroLighter loads grammars with a relative `` import(`./grammars/${language}.js`) ``, which Next.js (Turbopack) splits into per-language chunks without extra configuration. A Vite-based Storybook that renders `CodeBlock` needs two settings, as squared's own Storybook now has: `microlighter` in `optimizeDeps.exclude` (pre-bundling moves the element away from its grammar files) and `build.dynamicImportVarsOptions.exclude` narrowed so it no longer skips `microlighter` (otherwise `build-storybook` emits no grammar chunks).
