---
name: migrate-styled-components-to-css-modules
description: Step-by-step guide for migrating React components from styled-components to CSS Modules. Use this skill when converting styled-components to CSS Modules, refactoring legacy styled code, modernizing component styling, or preparing squared package components for the NO BUILD STEP architecture. Covers component conversion, design token usage, dynamic styles, testing updates, and both squared package and squareone app migration patterns.
---

# Migrating from Styled-Components to CSS Modules

Complete guide for converting components from styled-components (CSS-in-JS) to CSS Modules.

## When to Use This Skill

- Converting legacy styled-components in **squared package** (required for NO BUILD STEP)
- Modernizing components in **squareone app** (optional but recommended)
- Improving performance by eliminating runtime CSS-in-JS
- Preparing components for better SSR performance
- Standardizing on CSS Modules approach

## Why Migrate?

### Performance Benefits

- **No runtime overhead** - CSS computed at build time
- **Better SSR** - No flash of unstyled content
- **Smaller bundle** - No styled-components runtime
- **Faster hydration** - Static CSS, no JavaScript execution

### Architecture Benefits

- **Standards-based** - CSS Modules are a standard approach
- **Better caching** - CSS files cached separately from JavaScript
- **Simpler tooling** - No special Babel plugins needed
- **Type safety** - TypeScript can validate CSS Module imports

### Squared Package Requirement

The squared package **must use CSS Modules** because:
- NO BUILD STEP architecture exports TypeScript source
- Apps transpile the package themselves
- styled-components would require additional runtime dependencies
- CSS Modules align with design token system

## Migration Process

### Step 1: Analyze Current Component

Identify what needs conversion:
- Styled component definitions
- Props-based dynamic styles
- Theming dependencies
- Pseudo-elements and states
- Media queries
- Nested selectors

### Step 2: Create CSS Module File

Create `ComponentName.module.css` next to your component.

**Template structure:**

```css
/* ComponentName.module.css */

/* Base styles */
.container {
  /* Use design tokens */
  padding: var(--sqo-space-md);
  background-color: var(--rsd-color-primary-600);
  border-radius: var(--sqo-border-radius-1);
  box-shadow: var(--sqo-elevation-md);
}

/* Variants using data attributes */
.container[data-variant='primary'] {
  background-color: var(--rsd-color-primary-600);
  color: var(--rsd-component-text-reverse-color);
}

.container[data-variant='secondary'] {
  background-color: var(--rsd-color-blue-600);
  color: var(--rsd-component-text-reverse-color);
}

/* Size variants */
.container[data-size='small'] {
  padding: var(--sqo-space-sm);
  font-size: 0.875rem;
}

.container[data-size='large'] {
  padding: var(--sqo-space-lg);
  font-size: 1.125rem;
}

/* State modifiers */
.container[data-disabled='true'] {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Pseudo-classes */
.container:hover {
  background-color: var(--rsd-color-primary-500);
}

.container:focus {
  outline: 2px solid var(--rsd-color-primary-400);
  outline-offset: 2px;
}

/* Nested elements */
.title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--rsd-component-text-color);
  margin-bottom: var(--sqo-space-sm);
}

.content {
  font-size: 1rem;
  line-height: 1.5;
}

/* Media queries */
@media (min-width: 768px) {
  .container {
    padding: var(--space-lg);
  }

  .title {
    font-size: var(--font-size-xl);
  }
}
```

See [templates/component.module.css](templates/component.module.css) for a complete template.

### Step 3: Convert Component Code

**Before (styled-components):**

```typescript
import styled from 'styled-components';

const StyledButton = styled.button<{ variant?: string; size?: string }>`
  padding: ${props => props.size === 'large' ? '1rem 2rem' : '0.5rem 1rem'};
  background-color: ${props => props.variant === 'secondary' ? '#6c757d' : '#007bff'};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: ${props => props.size === 'large' ? '1.125rem' : '1rem'};

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

type ButtonProps = {
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'large';
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
};

export default function Button({
  variant = 'primary',
  size,
  disabled,
  children,
  onClick
}: ButtonProps) {
  return (
    <StyledButton
      variant={variant}
      size={size}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </StyledButton>
  );
}
```

**After (CSS Modules):**

```typescript
import styles from './Button.module.css';

type ButtonProps = {
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'large';
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
};

/**
 * Button component with multiple variants and sizes.
 */
export default function Button({
  variant = 'primary',
  size,
  disabled = false,
  children,
  onClick
}: ButtonProps) {
  return (
    <button
      className={styles.button}
      data-variant={variant}
      data-size={size}
      data-disabled={disabled}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

See [examples/before-after/](examples/before-after/) for complete examples.

### Step 4: Replace Hardcoded Values with Design Tokens

**Before:**
```css
.button {
  padding: 16px;
  background: #0066cc;
  border-radius: 4px;
  font-size: 16px;
}
```

**After:**
```css
.button {
  padding: var(--sqo-space-md);
  background: var(--rsd-color-primary-600);
  border-radius: var(--sqo-border-radius-1);
  font-size: 1rem;
}
```

**Available design tokens** (see **design-system** skill for complete reference):
- **Spacing**: `--sqo-space-{xxxs,xxs,xs,sm,md,lg,xl,xxl,xxxl}` (responsive) or `--sqo-space-*-fixed` (fixed)
- **Colors**: `--rsd-color-{primary,blue,green,red,orange,yellow,purple,gray}-{100-800}`
- **Semantic colors**: `--rsd-component-text-color`, `--rsd-component-text-link-color`, etc.
- **Border radius**: `--sqo-border-radius-{0,1,2}`
- **Elevations**: `--sqo-elevation-{0,xs,sm,base,md,lg,xl,2xl,inner,outline}`
- **Transitions**: `--sqo-transition-basic`

### Step 5: Handle Dynamic Styles

#### Pattern 1: Data Attributes (Recommended)

```css
.button[data-variant='primary'] {
  background-color: var(--rsd-color-primary-600);
}

.button[data-variant='secondary'] {
  background-color: var(--rsd-color-blue-600);
}

.button[data-loading='true'] {
  cursor: wait;
  opacity: 0.7;
}
```

```typescript
<button
  className={styles.button}
  data-variant={variant}
  data-loading={isLoading}
>
  {children}
</button>
```

#### Pattern 2: Conditional Class Names

```typescript
import classNames from 'classnames'; // or use a helper function

<button
  className={classNames(styles.button, {
    [styles.active]: isActive,
    [styles.disabled]: isDisabled,
    [styles.loading]: isLoading,
  })}
>
  {children}
</button>
```

```css
.button { /* base styles */ }
.button.active { /* active styles */ }
.button.disabled { /* disabled styles */ }
.button.loading { /* loading styles */ }
```

#### Pattern 3: CSS Variables for Truly Dynamic Values

```typescript
<div
  className={styles.progressBar}
  style={{ '--progress': `${progress}%` } as React.CSSProperties}
/>
```

```css
.progressBar {
  width: 100%;
  height: 8px;
  background: var(--rsd-color-gray-100);
}

.progressBar::after {
  content: '';
  width: var(--progress);
  background: var(--rsd-color-primary-600);
}
```

### Step 6: Convert Compound Components

**Before:**
```typescript
const Card = styled.div`/* ... */`;
const CardHeader = styled.div`/* ... */`;
const CardBody = styled.div`/* ... */`;

Card.Header = CardHeader;
Card.Body = CardBody;
```

**After:**
```typescript
// Card.module.css
.card { /* ... */ }
.header { /* ... */ }
.body { /* ... */ }

// Card.tsx
import styles from './Card.module.css';

export default function Card({ children }: { children: React.ReactNode }) {
  return <div className={styles.card}>{children}</div>;
}

function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className={styles.header}>{children}</div>;
}

function CardBody({ children }: { children: React.ReactNode }) {
  return <div className={styles.body}>{children}</div>;
}

Card.Header = CardHeader;
Card.Body = CardBody;
```

### Step 7: Update Tests

**Before (testing styled-components):**
```typescript
const button = wrapper.find(StyledButton);
expect(button).toHaveStyleRule('background-color', '#007bff');
```

**After (testing behavior):**
```typescript
const button = screen.getByRole('button');
expect(button).toHaveAttribute('data-variant', 'primary');
expect(button).toBeInTheDocument();
```

**Key principle**: Test behavior and accessibility, not implementation details.

### Step 8: Update Storybook Stories

Stories work the same way - just import the updated component:

```typescript
// No changes needed to story structure!
import Button from './Button';

export default {
  title: 'Components/Button',
  component: Button,
};

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Click Me',
  },
};
```

### Step 9: Remove styled-components Dependencies

After migrating all components in a package:

```bash
# Remove styled-components
pnpm remove styled-components @types/styled-components

# For Next.js apps, also update next.config.js
# Remove: compiler: { styledComponents: true }
```

## Common Patterns

### Theming

**Before (ThemeProvider):**
```typescript
const Button = styled.button`
  background: ${props => props.theme.colors.primary};
`;
```

**After (CSS variables):**
```css
.button {
  background: var(--rsd-color-primary-600);
}
```

Theme switching handled at root by updating CSS variable values.

### Conditional Styling

**Before:**
```typescript
const Box = styled.div<{ $isActive: boolean }>`
  ${props => props.$isActive && `
    background: blue;
    border: 2px solid darkblue;
  `}
`;
```

**After:**
```css
.box[data-active='true'] {
  background: var(--rsd-color-primary-600);
  border: 2px solid var(--rsd-color-primary-700);
}
```

### Pseudo-elements

**Before:**
```typescript
const Button = styled.button`
  &::before {
    content: '';
    /* ... */
  }
`;
```

**After:**
```css
.button::before {
  content: '';
  /* ... */
}
```

### Responsive Design

**Before:**
```typescript
const Container = styled.div`
  padding: 1rem;

  @media (min-width: 768px) {
    padding: 2rem;
  }
`;
```

**After:**
```css
.container {
  padding: var(--sqo-space-md);
}

@media (min-width: 768px) {
  .container {
    padding: var(--sqo-space-lg);
  }
}
```

### Animations

**Before:**
```typescript
const FadeIn = styled.div`
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  animation: fadeIn 0.3s ease-in;
`;
```

**After:**
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fadeIn {
  animation: fadeIn 0.3s ease-in;
}
```

## Migration Checklist

Use this checklist for each component:

- [ ] Create `.module.css` file
- [ ] Convert all styles to CSS classes
- [ ] Replace hardcoded values with design tokens
- [ ] Handle dynamic styles (data attributes or conditional classes)
- [ ] Convert compound components
- [ ] Update TypeScript types (remove styled-components types)
- [ ] Update tests (test behavior, not styles)
- [ ] Verify Storybook stories still work
- [ ] Test all variants and states
- [ ] Check responsive behavior
- [ ] Test in both light and dark modes (if applicable)
- [ ] Remove styled-components imports
- [ ] Update component exports if needed

## Squared Package vs Squareone App

### Squared Package (Required)

- **Must use CSS Modules** - No styled-components allowed
- Part of NO BUILD STEP architecture
- Ensures package can be transpiled by consuming apps

### Squareone App (Optional)

- **Can still use styled-components** - Legacy pattern supported
- Migration recommended for performance
- New components should use CSS Modules
- Existing components can be migrated incrementally

## Troubleshooting

### Styles Not Applying

**Issue**: CSS Module styles don't appear.

**Solutions**:
1. Verify import: `import styles from './Component.module.css';`
2. Check className usage: `className={styles.className}`
3. Ensure CSS file has `.className` defined
4. Check for typos in className

### TypeScript Errors

**Issue**: TypeScript doesn't recognize `.module.css` imports.

**Solution**: Add to `*.d.ts`:
```typescript
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}
```

### Dynamic Styles Not Working

**Issue**: Conditional styles not applying.

**Solutions**:
1. Use data attributes: `data-variant={variant}`
2. Use classNames helper for conditional classes
3. Use inline CSS variables for truly dynamic values

### Global Styles Needed

**Issue**: Need to share styles across components.

**Solution**: Use `:global()` in CSS Modules:
```css
:global(.my-global-class) {
  /* styles */
}
```

Or import from `@lsst-sqre/global-css`.

## Performance Impact

### Before Migration

- Styled-components runtime: ~15KB gzipped
- CSS-in-JS computation on every render
- Flash of unstyled content during SSR hydration

### After Migration

- No runtime dependency
- Static CSS computed at build time
- Instant style application on SSR

**Typical improvements**:
- Initial page load: 10-20% faster
- Time to interactive: 15-25% faster
- Bundle size: 15KB smaller

## Best Practices

1. **Migrate incrementally** - One component at a time
2. **Start with leaf components** - Components with no dependencies
3. **Test thoroughly** - All variants, states, and interactions
4. **Use design tokens** - Always prefer CSS variables over hardcoded values
5. **Prefer data attributes** - For variant-based styling
6. **Keep semantics** - Maintain the same HTML structure
7. **Test accessibility** - Ensure ARIA attributes and roles preserved
8. **Document patterns** - Add comments for complex CSS
9. **Review with team** - Get feedback on approach
10. **Update incrementally** - Don't block other work

## Examples

See [examples/](examples/) directory for:
- Complete before/after component examples
- Complex component migrations (forms, modals, navigation)
- Compound component patterns
- Dynamic styling patterns
- Animation conversions

## Related Skills

- **design-system** - Complete CSS variable and design token reference
- **component-creation** - Creating new components with CSS Modules
- **squared-package** - Understanding NO BUILD STEP architecture
- **testing-infrastructure** - Testing migrated components

## References

- CSS Modules documentation: https://github.com/css-modules/css-modules
- Design tokens: `@lsst-sqre/rubin-style-dictionary`
- Global CSS: `@lsst-sqre/global-css`
