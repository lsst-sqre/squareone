---
'squareone': minor
---

Add comprehensive sidebar layout system and settings pages

- **New sidebar navigation page layout::**

  - `SidebarLayout`: Responsive layout component with mobile-first design, CSS Grid on desktop, and flexbox on mobile
  - `MobileMenuToggle`: Hamburger menu component with accessibility features and smooth animations
  - `Sidebar`: Navigation sidebar with sticky positioning and structured navigation sections
  - `SidebarNavItem`: Individual navigation items with hover, active, and focus states
  - `SidebarNavSection`: Grouped navigation with optional section labels

- **Settings pages implementation:**
  - `SettingsLayout`: Settings-specific layout using the sidebar system with dynamic navigation
  - Three settings pages: Account (`/settings/`), Sessions (`/settings/sessions`), and Access Tokens (`/settings/tokens`)
  - Dynamic navigation filtering based on `AppConfig` (e.g., sessions page visibility controlled by `settingsSessionsVisible`)
  - Complete server-side rendering with proper `getServerSideProps` implementation
