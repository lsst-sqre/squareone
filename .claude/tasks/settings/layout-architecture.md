# SidebarLayout Component Architecture

## Executive Summary

This document describes a two-tier component architecture for sidebar-based layouts:

- **SidebarLayout**: A generic, reusable component for any sidebar + content layout
- **SettingsLayout**: A specialized implementation using SidebarLayout with dynamic content based on app configuration and user context

The architecture leverages Next.js's `getLayout` pattern for smooth page transitions while maintaining access to React context hooks for dynamic content. The layout is responsive, accessible, and integrates seamlessly with the existing Page component structure.

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

   - Heading/title for the section (e.g., "Settings") - links to first navigation item
   - List of navigation items (page titles)
   - Optional section groupings with labels
   - Active/current page highlighting (bold with thick left border)
   - Hover states with muted primary background
   - Dynamic content based on configuration and user context

2. **Behavior**
   - Desktop: Always visible, sticky positioning
   - Mobile: Hidden by default, slide down/up animation (0.3s ease)
   - Mobile header: Sticky with title left, hamburger right
   - Current page indication with visual highlight
   - Keyboard navigation with proper tab order (nav first, then content)
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
  children: React.ReactNode; // Main content
  sidebarTitle: string; // e.g., "Settings"
  navSections: NavSection[]; // Navigation sections
  currentPath?: string; // Current active path (auto-detected if not provided)
  prefetchPages?: boolean; // Optional: prefetch linked pages (default: false)
  titleHref?: string; // Optional: override for title link (defaults to first nav item)
};

type NavSection = {
  label?: string; // Optional section label
  items: NavItem[]; // Navigation items in this section
};

type NavItem = {
  href: string; // Internal path
  label: string; // Display text
};
```

**Responsibilities:**

- Generic container for any sidebar + content layout
- Manages responsive breakpoint behavior
- Controls mobile menu state via react-a11y-disclosure
- Applies ContentMaxWidth constraint
- Auto-detects current path from Next.js router
- Optional page prefetching for performance
- Reusable across different sections of the app
- No page-specific data passed through layout
- Layout focuses solely on navigation and responsive behavior

**Styling approach:**

- CSS Grid for desktop layout with two columns and 2rem gap
- Flexbox for mobile vertical stacking
- CSS custom properties for consistent spacing
- Sticky positioning for sidebar on desktop

#### 2. Sidebar Component

```typescript
type SidebarProps = {
  title: string;
  titleHref: string; // Link destination for title (first nav item)
  navSections: NavSection[];
  currentPath: string;
  onNavigate: () => void; // Called when navigation occurs (for mobile menu close)
};
```

**Responsibilities:**

- Renders sidebar heading as link to first navigation item
- Contains navigation sections and items
- Handles scrollable content if needed
- Applies hover and active states
- Manages mobile menu visibility

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

#### 4. SettingsLayout Component (Specialized with Dynamic Content)

```typescript
// SettingsLayout/SettingsLayout.tsx
import { ReactElement, useMemo } from 'react';
import { SidebarLayout } from '../SidebarLayout';
import { useAppConfig } from '../../contexts/AppConfigContext';
import { useGafaelfawrUser } from '../../hooks/useGafaelfawrUser';
import { getSettingsNavigation } from './settingsNavigation';

type SettingsLayoutProps = {
  children: React.ReactNode;
};

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const config = useAppConfig();
  const { data: user } = useGafaelfawrUser();

  // Dynamically filter navigation based on config
  const navSections = useMemo(() => getSettingsNavigation(config), [config]);

  // Simple title with username if available
  const sidebarTitle = user?.username
    ? `${user.username} Settings`
    : 'Settings';

  return (
    <SidebarLayout
      sidebarTitle={sidebarTitle}
      navSections={navSections}
      prefetchPages={true} // Prefetch settings pages for faster navigation
    >
      {children}
    </SidebarLayout>
  );
}

// For Next.js getLayout pattern - maintains smooth transitions
export function getLayout(page: ReactElement) {
  return <SettingsLayout>{page}</SettingsLayout>;
}

// SettingsLayout/settingsNavigation.ts
import type { AppConfig } from '../../contexts/AppConfigContext';

export function getSettingsNavigation(config: AppConfig) {
  const navigation = [
    {
      items: [
        { href: '/settings/profile', label: 'Profile' },
        { href: '/settings/access-tokens', label: 'Access Tokens' },
      ],
    },
    {
      label: 'Security',
      items: [{ href: '/settings/sessions', label: 'Sessions' }],
    },
  ];

  // Only include Files section if file server is configured
  // Items and sections are omitted entirely from DOM tree
  if (config.fileServerUrl) {
    navigation.push({
      label: 'Storage',
      items: [{ href: '/settings/files', label: 'Files' }],
    });
  }

  return navigation;
}
```

##### Navigation Item Visibility

- **Items and sections are omitted entirely** from the DOM tree when conditions are not met
- No grayed out or disabled states - items are either present or absent
- If all items in a section are omitted, the section header is also omitted

##### User Data Integration

- **Simple username display**: Show "Settings" when username is unknown, "{{username}} Settings" when available
- No complex loading states - graceful degradation from generic to personalized title
- Navigation remains fully interactive regardless of user data loading state

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

.mobile-header {
  position: sticky;
  top: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  z-index: 10;
}

.mobile-header-title {
  font-weight: bold;
}

.hamburger-button {
  margin-left: auto;
}

/* Using react-a11y-disclosure for show/hide behavior */
.sidebar-nav {
  transition: max-height 0.3s ease, opacity 0.3s ease;
}
```

##### Mobile Menu Behavior

- **Auto-close menu on navigation** to new page
- Menu state resets on each page navigation
- Swipe gestures deferred to Future Work

### State Management

- Use `react-a11y-disclosure` hook for mobile menu toggle
- Use Next.js `useRouter` to get current path
- Auto-close menu on route change using useEffect

### Accessibility Considerations

1. **ARIA Attributes**

   - `aria-expanded` on hamburger button
   - `aria-current="page"` for active navigation item
   - Proper heading hierarchy with sidebar title
   - `aria-label` for navigation sections

2. **Keyboard Navigation**

   - Tab order: navigation items first, then main content
   - All navigation items focusable via Tab key
   - Escape key closes mobile menu
   - Focus management when menu opens/closes
   - Enter/Space activates navigation links

3. **Screen Reader Support**
   - Semantic HTML structure (`<nav>`, `<aside>`)
   - Descriptive labels for interactive elements
   - Announce menu state changes
   - Skip links to jump to main content

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

### Critical Requirement: Data Loading

**IMPORTANT**: Every page using SettingsLayout MUST implement `getServerSideProps` to load the AppConfig. This ensures the layout has access to configuration data for dynamic navigation filtering.

### Using Next.js getLayout Pattern with Required Data Loading

```typescript
// pages/settings/profile.tsx
import type { ReactElement } from 'react';
import type { GetServerSideProps } from 'next';
import type { NextPageWithLayout } from '../_app';
import { getLayout } from '../../components/SettingsLayout';
import { loadAppConfig } from '../../lib/config/loader';

type ProfilePageProps = {
  // Add any page-specific props here
};

const ProfilePage: NextPageWithLayout<ProfilePageProps> = () => {
  return (
    <>
      <h1>Profile Settings</h1>
      <form>{/* Profile form fields */}</form>
    </>
  );
};

ProfilePage.getLayout = getLayout;

// REQUIRED: Load appConfig for the layout to access
export const getServerSideProps: GetServerSideProps<
  ProfilePageProps
> = async () => {
  const appConfig = await loadAppConfig();

  return {
    props: {
      appConfig, // Required for AppConfigProvider in _app.tsx
      // Add any page-specific data here
    },
  };
};

export default ProfilePage;
```

```typescript
// pages/settings/access-tokens.tsx
import type { ReactElement } from 'react';
import type { GetServerSideProps } from 'next';
import type { NextPageWithLayout } from '../_app';
import { getLayout } from '../../components/SettingsLayout';
import { loadAppConfig } from '../../lib/config/loader';

type AccessTokensPageProps = {
  // Add any page-specific props here
};

const AccessTokensPage: NextPageWithLayout<AccessTokensPageProps> = () => {
  return (
    <>
      <h1>Access Tokens</h1>
      {/* Access tokens management UI */}
    </>
  );
};

AccessTokensPage.getLayout = getLayout;

// REQUIRED: Load appConfig for the layout to access
export const getServerSideProps: GetServerSideProps<
  AccessTokensPageProps
> = async () => {
  const appConfig = await loadAppConfig();

  // Can also load page-specific data
  // const tokens = await fetchUserTokens();

  return {
    props: {
      appConfig, // Required for AppConfigProvider in _app.tsx
      // tokens,
    },
  };
};

export default AccessTokensPage;
```

### App Configuration (\_app.tsx)

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

## Layout Composition & Data Flow

The SettingsLayout component works within the existing app architecture:

```
MyApp (_app.tsx)
├── Extract appConfig from pageProps (from getServerSideProps)
└── AppConfigProvider (provides appConfig via context)
    └── ThemeProvider
        └── Page (Header/Footer)
            └── getLayout(Component)
                └── SettingsLayout (via getLayout, can use useAppConfig)
                    └── SidebarLayout
                        └── Page content
```

### Data Flow Architecture

1. **Page Level**: Each settings page MUST implement `getServerSideProps` to load `appConfig`
2. **App Level**: `_app.tsx` extracts `appConfig` from pageProps and provides it via `AppConfigProvider`
3. **Layout Level**: `SettingsLayout` (called via getLayout) can access config via `useAppConfig()` hook
4. **Result**: Dynamic navigation filtering works because the layout executes within the context provider tree

This ensures:

- SettingsLayout has access to AppConfig and user context via hooks
- The layout is wrapped by Page component (with Header/Footer)
- Smooth page transitions with persistent sidebar
- Dynamic content updates based on configuration
- No hydration issues since config is loaded server-side

## Benefits of This Architecture

1. **Separation of Concerns**: Generic `SidebarLayout` can be reused for other sections (docs, admin, etc.)
2. **Consistent Navigation**: Settings navigation defined once, shared across all settings pages
3. **Next.js Integration**: Leverages getLayout pattern for persistent layouts
4. **Performance**: Layout doesn't re-render on navigation between settings pages
5. **Type Safety**: Full TypeScript support with proper typing for pages with layouts
6. **Dynamic Content**: Navigation and title adapt based on configuration and user context
7. **Accessibility**: Proper keyboard navigation and ARIA attributes

## Alternative Approaches Considered

### 1. Instantiating SettingsLayout in Each Page (Not Recommended)

Instead of using getLayout, we could instantiate SettingsLayout directly in each page component:

```typescript
// NOT RECOMMENDED - loses smooth transitions
export default function ProfilePage() {
  return (
    <SettingsLayout>
      <h1>Profile Settings</h1>
    </SettingsLayout>
  );
}
```

**Drawbacks**:

- Layout re-renders on every navigation
- Loss of smooth page transitions
- More boilerplate in each page

### 2. Client-Side Data Loading in Layout (Not Recommended)

We could fetch configuration in the layout using SWR or useEffect:

```typescript
// NOT RECOMMENDED - causes hydration issues
function SettingsLayout({ children }) {
  const { data: config } = useSWR('/api/config', fetcher);
  // ...filter navigation based on config
}
```

**Drawbacks**:

- Flash of incorrect navigation on initial load
- Additional API call overhead
- Potential hydration mismatches

### 3. Static Navigation Configuration (Limited)

We could define all navigation statically without dynamic filtering:

```typescript
// LIMITED - no dynamic content
const staticNavigation = [
  /* all items always visible */
];
```

**Drawbacks**:

- Cannot hide/show items based on configuration
- Cannot personalize with user data
- Less flexible for different deployments

## Recommended Approach

The architecture described in this document (getLayout with required getServerSideProps) is recommended because:

- Maintains smooth page transitions via persistent layouts
- Enables dynamic content through context hooks
- Avoids hydration issues with server-side data loading
- Follows Next.js best practices

## Remaining Questions for Implementation

1. **Error Handling**

   - How should the layout behave if useGafaelfawrUser hook fails?
   - Should there be fallback behavior for missing navigation items?

2. **Performance Considerations**

   - Should navigation sections with many items be rendered lazily?
   - How should we handle rapid navigation between pages?

3. **Focus Management**
   - Where should focus go when mobile menu closes after navigation?
   - Should we scroll to top when navigating between settings pages?

## Future Work

The following features are deferred for future implementation:

### 1. Breadcrumb Navigation

- Add breadcrumb navigation for better context
- Consider integration with sidebar navigation structure
- Useful for deep navigation hierarchies

### 2. Performance Optimization

- Implement React.memo for sidebar components
- Measure and optimize re-render behavior
- Consider virtualization for very long navigation lists

### 3. Advanced Keyboard Navigation

- Add keyboard shortcuts (e.g., `/` to focus search)
- Arrow key navigation between menu items
- Quick jump to sections with number keys

### 4. Enhanced Mobile Experience

- Swipe gestures for menu open/close
- Improved touch targets for mobile devices
- Consider bottom sheet pattern for mobile menu

### 5. Theming Support

- Dark mode support for sidebar
- Custom color schemes per section
- User-configurable sidebar width

### 6. Analytics Integration

- Track navigation usage patterns
- Monitor page transition performance
- User journey analysis through settings

### 7. Sidebar Content Extensions

- Additional content below navigation (user info, logout button)
- Footer area in sidebar for version info or links
- User preferences or quick actions

**Extensibility Analysis**: The current architecture supports future content extensions well:

- `SidebarLayout` could accept an optional `sidebarFooter` prop for additional content
- `SettingsLayout` could compose user info components and pass them through
- The sticky positioning and scrollable design accommodates variable content height
- CSS Grid layout can easily add additional rows for footer content

## Implementation Recommendations

### Phase 1: Core Implementation

1. **Start with SidebarLayout**: Implement the generic component first for maximum reusability
2. **Focus on responsive design**: Ensure mobile-first approach with proper breakpoints
3. **Implement accessibility**: Include ARIA attributes and keyboard navigation from the start
4. **Test with static navigation**: Verify layout behavior before adding dynamic features

### Phase 2: Settings Integration

1. **Create SettingsLayout**: Build the specialized wrapper with basic navigation
2. **Add AppConfig integration**: Implement dynamic navigation filtering
3. **Integrate user context**: Add username display with graceful fallback
4. **Test page transitions**: Ensure smooth navigation between settings pages

### Phase 3: Polish and Optimization

1. **Add prefetching**: Implement optional page prefetching for performance
2. **Refine animations**: Perfect mobile menu transitions and hover states
3. **Add error boundaries**: Handle edge cases gracefully
4. **Performance testing**: Measure and optimize re-render behavior

### Development Guidelines

- **Follow existing patterns**: Use the same TypeScript, styling, and component patterns as MainContent and WideContentLayout
- **Test across viewports**: Verify behavior at the 60rem breakpoint and various screen sizes
- **Validate accessibility**: Test with screen readers and keyboard navigation
- **Consider edge cases**: Empty navigation sections, very long page titles, slow user data loading

### Testing Strategy

- **Unit tests**: Test navigation filtering logic and responsive breakpoints
- **Integration tests**: Verify context integration and page transitions
- **E2E tests**: Test mobile menu behavior and keyboard navigation
- **Visual regression**: Ensure consistent styling across different states

## Conclusion

This architecture provides a robust foundation for settings-style layouts while balancing several competing requirements:

- **Reusability**: The generic SidebarLayout can be used for docs, admin panels, and other sections
- **Performance**: Leverages Next.js getLayout pattern for smooth page transitions
- **Flexibility**: Dynamic navigation based on configuration and user context
- **Accessibility**: Built-in keyboard navigation and screen reader support
- **Maintainability**: Clear separation between generic layout and settings-specific logic

The two-tier approach (generic + specialized components) with the getLayout pattern ensures both immediate utility for the settings section and long-term architectural benefits for the entire application.
