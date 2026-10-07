# @lsst-sqre/global-css

This package provides global CSS for Squareone applications. These base CSS files mix in a basic reset, CSS custom properties from the Rubin Style Dictionary, and application of these properties to HTML elements.

## Installation

Link to this package in your application's `package.json`:

```json
{
  "dependencies": {
    "@lsst-sqre/global-css": "workspace:*"
  }
}
```

## Entries

The package builds two stylesheets with Lightning CSS, each a separate entry in `dist/`:

- **`dist/next.css`**: the base stylesheet. It provides a CSS reset, the design tokens from `@lsst-sqre/rubin-style-dictionary` (light and dark) as CSS custom properties, the Squareone `--sqo-*` tokens, and the base styles that apply those tokens to HTML elements.
- **`dist/syntax.css`**: syntax highlighting colours for the `CodeBlock` component from `@lsst-sqre/squared`. It provides MicroLighter's GitHub theme, which sets `--syntax-*` colour variables on `[data-syntax-theme="github"]` containers and adds global `::highlight()` rules for the token categories.

The syntax theme is a separate entry because Next.js 16.3's Turbopack bundles an older Lightning CSS that doesn't recognize the `::highlight()` pseudo-element. `next dev` and `next build` log a "Parsing CSS source code failed" warning for `dist/syntax.css` and keep its rules through error recovery. Keeping those rules out of `dist/next.css` means a parse failure can only affect syntax highlighting, never the base stylesheet. The squareone app's `build` script checks that the `::highlight()` rules reach its emitted CSS.

Both entries build with the same Lightning CSS targets. `CodeBlock`'s styles depend on the `--lightningcss-light` / `--lightningcss-dark` toggles that those targets produce for the theme's `light-dark()` colours.

## Usage

### Next.js applications

In your Next.js application, import both stylesheets in the root layout (`src/app/layout.tsx`):

```js
import '@fontsource/source-sans-pro/400.css';
import '@fontsource/source-sans-pro/400-italic.css';
import '@fontsource/source-sans-pro/700.css';
import '@lsst-sqre/global-css/dist/next.css';
import '@lsst-sqre/global-css/dist/syntax.css';
```

The imports from `@fontsource` provide the Source Sans Pro font family. Import `dist/syntax.css` in any app or Storybook that renders `CodeBlock`; without it, code displays as plain, uncoloured monospace text.

For Storybook, repeat the above imports in `.storybook/preview.ts` (or `preview.tsx`).
