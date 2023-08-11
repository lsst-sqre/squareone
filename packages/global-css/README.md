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

## Usage

### Next.js applications

In your Next.js application, import the CSS file in your `_app.ts` file:

```js
import '@fontsource/source-sans-pro/400.css';
import '@fontsource/source-sans-pro/400-italic.css';
import '@fontsource/source-sans-pro/700.css';
import '@lsst-sqre/global-css/dist/next.css';
```

The imports from `@fontsource` provide the Source Sans Pro font family.

For Storybook, repeat the above imports, but in `.storybook/preview.js`.
