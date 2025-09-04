# SidebarLayout Component Architecture

## Requirements

### Layout Structure
1. **Desktop Layout (≥60rem viewport)**
   - Fixed-width sidebar (18rem) on the left
   - Main content area on the right (ContentMaxWidth - 18rem = 42rem)
   - Entire layout centered horizontally
   - ContentMaxWidth constraint (60rem total)
   - 2rem gap between sidebar and content
   - Sticky sidebar that scrolls independently if needed

2. **Mobile Layout (<60rem viewport)**
   - Vertical stacking: sidebar content above main content
   - Hamburger menu button to toggle sidebar navigation visibility
   - Menu pushes content down (not overlay)
   - Full-width content areas with appropriate padding
   - Auto-close menu on navigation

### Sidebar Navigation
1. **Components**
   - Heading/title for the section (e.g., "Settings")
   - List of navigation items (page titles)
   - Optional section groupings with labels
   - Active/current page highlighting (bold with thick left border)
   - Hover states with muted primary background

2. **Behavior**
   - Desktop: Always visible, sticky positioning
   - Mobile: Hidden by default, slide down/up animation (0.3s ease)
   - Current page indication with visual highlight
   - Accessible keyboard navigation
   - Internal navigation only (using Next.js Link)

### Technical Requirements
1. **Dependencies**
   - styled-components for styling
   - `@fortawesome/fontawesome-svg-core` for hamburger icon
   - `react-a11y-disclosure` for accessible menu behavior
   - Next.js Link for internal navigation
   - TypeScript for type safety

2. **Integration**
   - Must work within existing Next.js app structure
   - Follow existing component patterns from WideContentLayout and MainContent
   - Use design tokens from rubin-style-dictionary
   - Responsive using CSS media queries
   - Support for shared navigation across multiple pages

## Architectural Proposal

### Component Hierarchy

```
SidebarLayout/
├── index.ts                  # Re-export main component
├── SidebarLayout.tsx         # Main layout component
├── Sidebar.tsx              # Sidebar component with navigation
├── SidebarNav.tsx           # Navigation list component
├── SidebarNavItem.tsx       # Individual navigation item
├── SidebarNavSection.tsx    # Optional section grouping
├── MobileMenuToggle.tsx     # Hamburger button for mobile
└── SidebarLayout.stories.tsx # Storybook documentation
```

### Implementation Details

#### 1. SidebarLayout Component
```typescript
type SidebarLayoutProps = {
  children: React.ReactNode;          // Main content
  sidebarTitle: string;              // e.g., "Settings"
  navSections: NavSection[];          // Navigation sections
  currentPath?: string;               // Current active path (auto-detected if not provided)
};

type NavSection = {
  label?: string;                     // Optional section label
  items: NavItem[];                   // Navigation items in this section
};

type NavItem = {
  href: string;                       // Internal path
  label: string;                      // Display text
};
```

**Responsibilities:**
- Container for the entire layout
- Manages responsive breakpoint behavior
- Controls mobile menu state via react-a11y-disclosure
- Applies ContentMaxWidth constraint
- Auto-detects current path from Next.js router

**Styling approach:**
- CSS Grid for desktop layout with two columns and 2rem gap
- Flexbox for mobile vertical stacking
- CSS custom properties for consistent spacing
- Sticky positioning for sidebar on desktop

#### 2. Sidebar Component
```typescript
type SidebarProps = {
  title: string;
  navSections: NavSection[];
  currentPath: string;
  onNavigate: () => void;      // Called when navigation occurs (for mobile menu close)
};
```

**Responsibilities:**
- Renders sidebar heading
- Contains navigation sections and items
- Handles scrollable content if needed
- Applies hover and active states

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
  gap: 2rem;
  max-width: 60rem;
  margin: 0 auto;
}

.sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}
```

#### Mobile (<60rem)
```css
.layout-container {
  display: flex;
  flex-direction: column;
  padding: 0 var(--size-screen-padding-min);
}

/* Using react-a11y-disclosure for show/hide behavior */
.sidebar-nav {
  transition: max-height 0.3s ease, opacity 0.3s ease;
}
```

### State Management
- Use `react-a11y-disclosure` hook for mobile menu toggle
- Use Next.js `useRouter` to get current path
- Auto-close menu on route change using useEffect

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

## Visual Design Specifications

### Active State
- Bold font weight
- Thick left border (4px) in primary color
- Background: transparent

### Hover State
- Background: muted primary color (e.g., `var(--rsd-color-primary-100)`)
- Border radius: 0.5rem
- Transition: background-color 0.2s ease
- Full width within sidebar (not just text width)

### Section Labels
- Font size: smaller (0.875rem)
- Font weight: bold
- Color: muted neutral (e.g., `var(--rsd-color-gray-600)`)
- Margin: 1rem 0 0.5rem 0

## Usage Example

```typescript
// pages/settings/profile.tsx
import { SidebarLayout } from '../../components/SidebarLayout';

const settingsNavigation = [
  {
    // First section without label
    items: [
      { href: '/settings/profile', label: 'Profile' },
      { href: '/settings/access-tokens', label: 'Access Tokens' },
    ]
  },
  {
    label: 'Security',
    items: [
      { href: '/settings/sessions', label: 'Sessions' },
    ]
  },
  {
    label: 'Storage',
    items: [
      { href: '/settings/files', label: 'Files' },
    ]
  }
];

export default function ProfilePage() {
  return (
    <SidebarLayout 
      sidebarTitle="Settings"
      navSections={settingsNavigation}
    >
      <h1>Profile Settings</h1>
      {/* Page content */}
    </SidebarLayout>
  );
}

// Repeated pattern for other settings pages...
```

## Export Strategy

Based on the usage pattern, only the main `SidebarLayout` component needs to be exported. The navigation configuration is passed as props, making it easy to share across multiple pages by defining the navigation structure once and importing it.

```typescript
// index.ts
export { default as SidebarLayout } from './SidebarLayout';
export type { SidebarLayoutProps, NavSection, NavItem } from './SidebarLayout';
```

## Design Decisions Requiring Clarification

1. **Navigation Configuration Management**
   - Should the navigation configuration be defined in each page file or in a shared configuration file?
   - How should we handle active state detection - automatic based on URL or explicit?

2. **Sidebar Header**
   - Should the sidebar title be a link back to a main settings page?
   - Should there be an optional subtitle or description under the title?

3. **Mobile Menu Toggle Position**
   - Where should the hamburger button be positioned - top left, integrated with page header, or floating?
   - Should it remain visible when scrolling on mobile?

4. **Accessibility Features**
   - Should we add breadcrumb navigation for better context?
   - Should keyboard shortcuts be supported (e.g., / to focus search, arrow keys for navigation)?

5. **Performance Optimization**
   - Should the sidebar component be memoized to prevent re-renders?
   - Should navigation items lazy-load their target pages?

6. **Error Handling**
   - How should invalid/broken navigation links be handled?
   - Should there be a fallback for missing active state detection?