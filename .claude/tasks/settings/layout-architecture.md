# SidebarLayout Component Architecture

## Requirements

### Layout Structure
1. **Desktop Layout (≥60rem viewport)**
   - Fixed-width sidebar (18rem) on the left
   - Main content area on the right (ContentMaxWidth - 18rem = 42rem)
   - Entire layout centered horizontally
   - ContentMaxWidth constraint (60rem total)

2. **Mobile Layout (<60rem viewport)**
   - Vertical stacking: sidebar content above main content
   - Hamburger menu button to toggle sidebar navigation visibility
   - Full-width content areas with appropriate padding

### Sidebar Navigation
1. **Components**
   - Heading/title for the section (e.g., "Settings")
   - List of navigation items (page titles)
   - Active/current page highlighting
   - Smooth transitions for mobile menu open/close

2. **Behavior**
   - Desktop: Always visible
   - Mobile: Hidden by default, toggleable via hamburger menu
   - Current page indication with visual highlight
   - Accessible keyboard navigation

### Technical Requirements
1. **Dependencies**
   - styled-components for styling
   - `@fortawesome/fontawesome-svg-core` for hamburger icon
   - Consider radix-ui components for interactive elements (following existing patterns)
   - TypeScript for type safety

2. **Integration**
   - Must work within existing Next.js app structure
   - Follow existing component patterns from WideContentLayout and MainContent
   - Use design tokens from rubin-style-dictionary
   - Responsive using CSS media queries

## Architectural Proposal

### Component Hierarchy

```
SidebarLayout/
├── index.ts                  # Re-export
├── SidebarLayout.tsx         # Main layout component
├── Sidebar.tsx              # Sidebar component with navigation
├── SidebarNav.tsx           # Navigation list component
├── SidebarNavItem.tsx       # Individual navigation item
├── MobileMenuToggle.tsx     # Hamburger button for mobile
└── SidebarLayout.stories.tsx # Storybook documentation
```

### Implementation Details

#### 1. SidebarLayout Component
```typescript
type SidebarLayoutProps = {
  children: React.ReactNode;          // Main content
  sidebarTitle: string;              // e.g., "Settings"
  navItems: NavItem[];                // Navigation items
  currentPath?: string;               // Current active path
};

type NavItem = {
  href: string;
  label: string;
  isActive?: boolean;
};
```

**Responsibilities:**
- Container for the entire layout
- Manages responsive breakpoint behavior
- Controls mobile menu state
- Applies ContentMaxWidth constraint

**Styling approach:**
- CSS Grid for desktop layout with two columns
- Flexbox for mobile vertical stacking
- CSS custom properties for consistent spacing

#### 2. Sidebar Component
```typescript
type SidebarProps = {
  title: string;
  navItems: NavItem[];
  isOpen: boolean;              // Mobile menu state
  onClose: () => void;          // Mobile menu close handler
};
```

**Responsibilities:**
- Renders sidebar heading
- Contains navigation list
- Handles mobile menu visibility
- Manages focus trap when mobile menu is open

#### 3. MobileMenuToggle Component
```typescript
type MobileMenuToggleProps = {
  isOpen: boolean;
  onClick: () => void;
  ariaLabel?: string;
};
```

**Responsibilities:**
- Renders hamburger icon (FontAwesome bars icon)
- Toggles mobile menu visibility
- Provides accessible button with proper ARIA attributes
- Only visible on mobile viewports

### Responsive Strategy

#### Desktop (≥60rem)
```css
.layout-container {
  display: grid;
  grid-template-columns: 18rem 1fr;
  max-width: 60rem;
  margin: 0 auto;
}
```

#### Mobile (<60rem)
```css
.layout-container {
  display: flex;
  flex-direction: column;
  padding: 0 var(--size-screen-padding-min);
}

.sidebar {
  position: fixed;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
}

.sidebar.open {
  transform: translateX(0);
}
```

### State Management
- Use React `useState` for mobile menu open/closed state
- Pass current route from Next.js `useRouter` for active page highlighting
- Consider using `react-a11y-disclosure` for accessible menu behavior (already in dependencies)

### Accessibility Considerations
1. **ARIA Attributes**
   - `aria-expanded` on hamburger button
   - `aria-current="page"` for active navigation item
   - Proper heading hierarchy with sidebar title

2. **Keyboard Navigation**
   - Tab through navigation items
   - Escape key closes mobile menu
   - Focus management when menu opens/closes

3. **Screen Reader Support**
   - Semantic HTML structure (`<nav>`, `<aside>`)
   - Descriptive labels for interactive elements
   - Announce menu state changes

## Design Decisions Requiring Clarification

1. **Mobile Menu Behavior**
   - Should the mobile menu overlay the content or push it down?
   - Should clicking outside the menu close it?
   - What should happen when navigating to a new page - auto-close menu?

2. **Sidebar Styling**
   - Should the sidebar have a background color or border?
   - How should the active page indicator look (bold, underline, background, left border)?
   - Should there be hover states for navigation items?

3. **Navigation Structure**
   - Should navigation items support nested/hierarchical structure?
   - Should icons be supported alongside navigation labels?
   - Should there be support for external links vs internal navigation?

4. **Animation and Transitions**
   - What duration/easing for mobile menu slide animation?
   - Should there be a backdrop/overlay when mobile menu is open?
   - Should page transitions be animated when navigating?

5. **Component Library Integration**
   - Should we use existing Radix UI NavigationMenu primitive or build custom?
   - Would Radix UI Dialog be appropriate for mobile menu overlay?
   - Should we create a compound component pattern like PrimaryNavigation?

6. **Scroll Behavior**
   - Should the sidebar be sticky/fixed on desktop when main content scrolls?
   - How should long navigation lists be handled (scrollable sidebar)?
   - Should there be a scroll-to-top behavior when navigating?

7. **TypeScript Patterns**
   - Follow the pattern of using `type` instead of `interface` for props?
   - Should we export individual component types or keep them internal?