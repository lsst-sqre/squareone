# Consuming Squared Package in Apps

This guide covers setting up a Next.js app to consume the `@lsst-sqre/squared` component library.

## Required Configuration

### 1. Next.js Transpilation

Add to `next.config.js`:

```javascript
module.exports = {
  transpilePackages: ['@lsst-sqre/squared'],
  // ... rest of config
};
```

**Why needed**: Squared exports TypeScript source directly (no build step), so consuming apps must transpile it.

### 2. Import Global CSS

In your app's root component or layout:

```typescript
// src/app/layout.tsx
import '@lsst-sqre/global-css/dist/next.css';
import '@lsst-sqre/global-css/dist/syntax.css';
```

`dist/next.css` (the package's `main` entry) provides:
- CSS reset and base styles
- Design tokens as CSS custom properties

`dist/syntax.css` provides MicroLighter's GitHub theme, which colours `CodeBlock`. It's a separate entry so that Turbopack's "Parsing CSS source code failed" warning for its `::highlight()` rules can't affect the base stylesheet. Without it, `CodeBlock` renders plain, uncoloured text. Import both in the app's root layout and in `.storybook/preview.ts(x)`.

### 3. TypeScript Configuration

Ensure `tsconfig.json` can resolve squared types:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@lsst-sqre/squared": ["../node_modules/@lsst-sqre/squared/src"]
    }
  }
}
```

Usually not needed if using workspace dependencies correctly.

## Using Squared Components

### Importing Components

```typescript
// Named imports (recommended)
import { Button, Input, Card } from '@lsst-sqre/squared';

// Component-level imports (for tree-shaking)
import Button from '@lsst-sqre/squared/components/Button';
```

### Using in JSX

```typescript
import { Button } from '@lsst-sqre/squared';

export default function MyPage() {
  return (
    <div>
      <Button variant="primary" onClick={() => console.log('clicked')}>
        Click Me
      </Button>
    </div>
  );
}
```

## Design Tokens

Squared components use CSS custom properties (design tokens):

```css
/* Your app's CSS */
.myComponent {
  padding: var(--space-md);
  background: var(--color-background-primary);
  color: var(--color-text-primary);
  border-radius: var(--radius-md);
}
```

Tokens are automatically available after importing `@lsst-sqre/global-css/dist/next.css`.

### Available Token Categories

- **Colors**: `--color-*` (background, text, border, etc.)
- **Spacing**: `--space-*` (xs, sm, md, lg, xl, etc.)
- **Typography**: `--font-size-*`, `--font-weight-*`, `--line-height-*`
- **Border Radius**: `--radius-*`
- **Shadows**: `--shadow-*`
- **Z-index**: `--z-index-*`

See `@lsst-sqre/rubin-style-dictionary` package for complete token reference.

## Common Issues

### Error: "Unexpected token" or "Module parse failed"

**Cause**: Missing `transpilePackages` configuration.

**Solution**: Add `transpilePackages: ['@lsst-sqre/squared']` to `next.config.js`.

### Styles Not Applying

**Cause**: Global CSS not imported.

**Solution**: Import `@lsst-sqre/global-css/dist/next.css` in your app's root layout.

### Code Blocks Render Uncoloured

**Cause**: `@lsst-sqre/global-css/dist/syntax.css` not imported. `CodeBlock`'s token colours come from MicroLighter's GitHub theme in that stylesheet, not from `dist/next.css`.

**Solution**: Import `@lsst-sqre/global-css/dist/syntax.css` next to `dist/next.css` in the root layout and in `.storybook/preview.ts(x)`. In squareone, `pnpm build --filter squareone` fails if no emitted stylesheet contains a `::highlight(` rule (`apps/squareone/scripts/check-syntax-css.js`).

### TypeScript Errors

**Cause**: Type resolution issues.

**Solution**: Verify workspace dependencies are installed (`pnpm install`) and squared is in `node_modules/@lsst-sqre/`.

### Component Not Found

**Cause**: Component not exported from `@lsst-sqre/squared`.

**Solution**: Check `packages/squared/src/index.ts` for available exports.

## Development Workflow

### After Updating Squared Components

Changes in squared are immediately available (no build step):

```bash
# In squared package - no build needed!
# Just save your changes

# In consuming app
# Hot reload picks up changes automatically
```

### Type Safety

Since squared exports TypeScript source, you get:
- Full type safety in consuming app
- Intellisense for component props
- Type errors at compile time

### Debugging Squared Components

You can debug directly into squared source:
- Set breakpoints in `node_modules/@lsst-sqre/squared/src/`
- Source maps work automatically
- No build artifacts to navigate

## Example: Squareone App

The squareone app is a complete example:

```javascript
// apps/squareone/next.config.js
module.exports = {
  transpilePackages: ['@lsst-sqre/squared'],
  compiler: {
    styledComponents: true, // For app's own components
  },
  // ... rest of config
};
```

```typescript
// apps/squareone/src/app/layout.tsx
import '@lsst-sqre/global-css/dist/next.css'; // Base styles and tokens
import '@lsst-sqre/global-css/dist/syntax.css'; // CodeBlock syntax colours
```

## Best Practices

1. **Always import global CSS** at app root
2. **Use named imports** from '@lsst-sqre/squared'
3. **Use design tokens** in your app's CSS
4. **Don't modify squared components** - create wrapper components if needed
5. **Report bugs** in squared to the monorepo
6. **Use Storybook** to preview components before integration

## Performance

### Tree-Shaking

Squared is marked as `sideEffects: false`, enabling tree-shaking:

```typescript
// Only Button code is included in bundle
import { Button } from '@lsst-sqre/squared';
```

### CSS Modules

CSS is scoped per-component and automatically tree-shaken:
- Only imported components' styles are included
- No runtime CSS-in-JS overhead
- Better SSR performance

### Code Splitting

Next.js automatically code-splits components:

```typescript
// Lazy load squared components
const Button = dynamic(() =>
  import('@lsst-sqre/squared').then(mod => mod.Button)
);
```

## Testing Apps with Squared

### Unit Tests

Mock squared components if needed:

```typescript
jest.mock('@lsst-sqre/squared', () => ({
  Button: ({ children, ...props }) => <button {...props}>{children}</button>,
}));
```

### Integration Tests

Squared components work normally in tests:

```typescript
import { render, screen } from '@testing-library/react';
import { Button } from '@lsst-sqre/squared';

test('renders button', () => {
  render(<Button>Click Me</Button>);
  expect(screen.getByText('Click Me')).toBeInTheDocument();
});
```

### Storybook

Reference squared stories:

```typescript
// Your app's story
import { Button } from '@lsst-sqre/squared';

export default {
  title: 'App/MyFeature',
  component: MyFeature,
};

// Use squared components in stories
export const WithButton = () => (
  <MyFeature>
    <Button>Action</Button>
  </MyFeature>
);
```
