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
SidebarLayout/                        # Generic sidebar layout component
├── index.ts                         # Re-export main component
├── SidebarLayout.tsx                # Generic layout component
├── Sidebar.tsx                      # Sidebar component with navigation
├── SidebarNav.tsx                   # Navigation list component
├── SidebarNavItem.tsx               # Individual navigation item
├── SidebarNavSection.tsx            # Optional section grouping
├── MobileMenuToggle.tsx             # Hamburger button for mobile
└── SidebarLayout.stories.tsx        # Storybook documentation

SettingsLayout/                       # Settings-specific layout
├── index.ts                         # Re-export
├── SettingsLayout.tsx               # Settings layout using SidebarLayout
├── settingsNavigation.ts            # Settings navigation configuration
└── SettingsLayout.stories.tsx       # Storybook documentation
```

### Implementation Details

#### 1. SidebarLayout Component (Generic)
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
- Generic container for any sidebar + content layout
- Manages responsive breakpoint behavior
- Controls mobile menu state via react-a11y-disclosure
- Applies ContentMaxWidth constraint
- Auto-detects current path from Next.js router
- Reusable across different sections of the app

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

#### 4. SettingsLayout Component (Specialized)
```typescript
// SettingsLayout/SettingsLayout.tsx
import { ReactElement } from 'react';
import { SidebarLayout } from '../SidebarLayout';
import { settingsNavigation } from './settingsNavigation';

type SettingsLayoutProps = {
  children: React.ReactNode;
};

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <SidebarLayout
      sidebarTitle="Settings"
      navSections={settingsNavigation}
    >
      {children}
    </SidebarLayout>
  );
}

// For Next.js getLayout pattern
export function getLayout(page: ReactElement) {
  return <SettingsLayout>{page}</SettingsLayout>;
}

// SettingsLayout/settingsNavigation.ts
export const settingsNavigation = [
  {
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
```

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

## Usage Examples

### Using Next.js getLayout Pattern

```typescript
// pages/settings/profile.tsx
import type { ReactElement } from 'react';
import type { NextPageWithLayout } from '../_app';
import { getLayout } from '../../components/SettingsLayout';

const ProfilePage: NextPageWithLayout = () => {
  return (
    <>
      <h1>Profile Settings</h1>
      <form>
        {/* Profile form fields */}
      </form>
    </>
  );
};

ProfilePage.getLayout = getLayout;

export default ProfilePage;
```

```typescript
// pages/settings/access-tokens.tsx
import type { ReactElement } from 'react';
import type { NextPageWithLayout } from '../_app';
import { getLayout } from '../../components/SettingsLayout';

const AccessTokensPage: NextPageWithLayout = () => {
  return (
    <>
      <h1>Access Tokens</h1>
      {/* Access tokens management UI */}
    </>
  );
};

AccessTokensPage.getLayout = getLayout;

export default AccessTokensPage;
```

### App Configuration (_app.tsx)

```typescript
// pages/_app.tsx
import type { ReactElement, ReactNode } from 'react';
import type { NextPage } from 'next';
import type { AppProps } from 'next/app';

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? ((page) => page);

  return getLayout(<Component {...pageProps} />);
}
```

## Export Strategy

```typescript
// SidebarLayout/index.ts
export { default as SidebarLayout } from './SidebarLayout';
export type { SidebarLayoutProps, NavSection, NavItem } from './SidebarLayout';

// SettingsLayout/index.ts
export { default as SettingsLayout, getLayout } from './SettingsLayout';
```

## Benefits of This Architecture

1. **Separation of Concerns**: Generic `SidebarLayout` can be reused for other sections (docs, admin, etc.)
2. **Consistent Navigation**: Settings navigation defined once, shared across all settings pages
3. **Next.js Integration**: Leverages getLayout pattern for persistent layouts
4. **Performance**: Layout doesn't re-render on navigation between settings pages
5. **Type Safety**: Full TypeScript support with proper typing for pages with layouts

## Design Decisions Requiring Clarification

1. **Layout Composition**
   - Should SettingsLayout wrap the Page component (Header/Footer) or be wrapped by it?
   - How does SidebarLayout interact with the existing Page component?

2. **Sidebar Header**
   - Should the sidebar title be a link back to a main settings page (e.g., `/settings`)?
   - Should there be an optional subtitle or description under the title?

3. **Mobile Menu Toggle Position**
   - Where should the hamburger button be positioned - top left, integrated with page header, or floating?
   - Should it remain visible when scrolling on mobile?

4. **Accessibility Features**
   - Should we add breadcrumb navigation for better context?
   - Should keyboard shortcuts be supported (e.g., `/` to focus search, arrow keys for navigation)?

5. **Performance Optimization**
   - Should the sidebar component be memoized to prevent re-renders?
   - Should navigation items prefetch their target pages using Next.js prefetch?

6. **Error Handling**
   - How should invalid/broken navigation links be handled?
   - Should there be a 404 fallback within the settings section?

7. **Data Loading**
   - How should settings pages handle getServerSideProps with the layout pattern?
   - Should the layout support passing data to the sidebar (e.g., user info, dynamic nav items)?