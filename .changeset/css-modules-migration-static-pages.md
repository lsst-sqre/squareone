---
"squareone": minor
---

Migrate static page components from styled-components to CSS Modules

This change converts the following component groups to CSS Modules styling:

**Layout Core Components**

- `Page` - Main page wrapper component
- `MainContent` - Content area wrapper
- `WideContentLayout` - Full-width content layout

**Header Components**

- `Header` - Main site header
- `HeaderNav` - Navigation links in header
- `PreHeader` - Above-header section
- `Login` - User login/logout controls

**Footer Components**

- `Footer` - Main site footer
- `FooterComponents` - Footer sub-components (social links, copyright)

**Sidebar Components**

- `Sidebar` - Sidebar container
- `SidebarLayout` - Layout with sidebar
- `SidebarNavItem` - Individual navigation items
- `SidebarNavSection` - Navigation section groupings
- `MobileMenuToggle` - Mobile menu hamburger button

**Homepage Components**

- `HomepageHero` - Landing page hero section
- `FullBleedBackgroundImageSection` - Full-width background image sections

**Typography Components**

- `Typography` - Text styling components

**Static Page Components**

- `Section` - Content section component used in docs and support pages

This migration moves the squareone app closer to eliminating styled-components in favor of CSS Modules with design tokens, improving consistency with the squared component library architecture.
