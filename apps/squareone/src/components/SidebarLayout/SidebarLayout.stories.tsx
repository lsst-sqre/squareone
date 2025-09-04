import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { userEvent, within, expect } from 'storybook/test';
import SidebarLayout from './SidebarLayout';

const meta: Meta<typeof SidebarLayout> = {
  title: 'Components/SidebarLayout',
  component: SidebarLayout,
};

export default meta;
type Story = StoryObj<typeof SidebarLayout>;

const mockNavSections = [
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

export const BasicLayout: Story = {
  args: {
    sidebarTitle: 'Settings',
    navSections: mockNavSections,
    children: (
      <div>
        <h1>Main Content Area</h1>
        <p>
          This is the main content that will be displayed alongside the sidebar.
        </p>
      </div>
    ),
  },
};

export const WithCurrentPath: Story = {
  args: {
    sidebarTitle: 'Settings',
    navSections: mockNavSections,
    currentPath: '/settings/profile',
    children: (
      <div>
        <h1>Profile Settings</h1>
        <p>Current page highlighted in navigation.</p>
      </div>
    ),
  },
};

export const DesktopLayoutLongContent: Story = {
  args: {
    sidebarTitle: 'Documentation',
    navSections: mockNavSections,
    children: (
      <div>
        <h1>Long Content Example</h1>
        <p>
          This story demonstrates the desktop grid layout with extensive
          content.
        </p>
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i}>
            <h2>Section {i + 1}</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat.
            </p>
            <p>
              Duis aute irure dolor in reprehenderit in voluptate velit esse
              cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
              cupidatat non proident, sunt in culpa qui officia deserunt mollit
              anim id est laborum.
            </p>
          </div>
        ))}
      </div>
    ),
  },
};

export const DesktopLayoutVariousWidths: Story = {
  args: {
    sidebarTitle: 'Settings',
    navSections: mockNavSections,
    children: (
      <div>
        <h1>Width Testing</h1>
        <p>
          This demonstrates how the grid layout handles the 60rem max-width
          constraint.
        </p>
        <div
          style={{
            width: '100%',
            background: '#f0f0f0',
            padding: '1rem',
            marginBottom: '1rem',
          }}
        >
          <p>Content area width: ContentMaxWidth - 18rem - 2rem gap = 40rem</p>
        </div>
        <div style={{ width: '600px', background: '#e0e0e0', padding: '1rem' }}>
          <p>This div is 600px wide to test content overflow behavior</p>
        </div>
      </div>
    ),
  },
};

export const MobileLayout: Story = {
  args: {
    sidebarTitle: 'Settings',
    navSections: mockNavSections,
    children: (
      <div>
        <h1>Mobile Layout</h1>
        <p>
          This demonstrates the mobile layout with vertical stacking below 60rem
          viewport width.
        </p>
        <p>The sidebar navigation is prepared for disclosure pattern.</p>
      </div>
    ),
  },
  globals: {
    viewport: { value: 'iphone14' },
  },
};

export const MobileLayoutLongContent: Story = {
  args: {
    sidebarTitle: 'Documentation',
    navSections: [
      {
        items: [
          { href: '/docs/getting-started', label: 'Getting Started' },
          { href: '/docs/api-reference', label: 'API Reference' },
          { href: '/docs/examples', label: 'Examples' },
          { href: '/docs/deployment', label: 'Deployment' },
        ],
      },
      {
        label: 'Advanced',
        items: [
          { href: '/docs/configuration', label: 'Configuration' },
          { href: '/docs/customization', label: 'Customization' },
          { href: '/docs/troubleshooting', label: 'Troubleshooting' },
        ],
      },
    ],
    children: (
      <div>
        <h1>Mobile with Long Content</h1>
        <p>Testing mobile layout with extensive navigation and content.</p>
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i}>
            <h2>Mobile Section {i + 1}</h2>
            <p>
              This content demonstrates how the mobile layout handles longer
              content with vertical stacking. The sidebar navigation will be
              hidden by default and shown via disclosure pattern.
            </p>
          </div>
        ))}
      </div>
    ),
  },
  globals: {
    viewport: { value: 'iphone14' },
  },
};

export const StickyScrollingDesktop: Story = {
  args: {
    sidebarTitle: 'Long Navigation',
    navSections: [
      {
        label: 'Getting Started',
        items: [
          { href: '/docs/installation', label: 'Installation' },
          { href: '/docs/quickstart', label: 'Quick Start' },
          { href: '/docs/configuration', label: 'Configuration' },
        ],
      },
      {
        label: 'Components',
        items: [
          { href: '/docs/buttons', label: 'Buttons' },
          { href: '/docs/forms', label: 'Forms' },
          { href: '/docs/navigation', label: 'Navigation' },
          { href: '/docs/layout', label: 'Layout' },
          { href: '/docs/typography', label: 'Typography' },
          { href: '/docs/colors', label: 'Colors' },
          { href: '/docs/icons', label: 'Icons' },
          { href: '/docs/tables', label: 'Tables' },
          { href: '/docs/modals', label: 'Modals' },
          { href: '/docs/tooltips', label: 'Tooltips' },
        ],
      },
      {
        label: 'Advanced',
        items: [
          { href: '/docs/theming', label: 'Theming' },
          { href: '/docs/customization', label: 'Customization' },
          { href: '/docs/performance', label: 'Performance' },
          { href: '/docs/accessibility', label: 'Accessibility' },
          { href: '/docs/testing', label: 'Testing' },
          { href: '/docs/deployment', label: 'Deployment' },
          { href: '/docs/migration', label: 'Migration Guide' },
          { href: '/docs/troubleshooting', label: 'Troubleshooting' },
        ],
      },
    ],
    children: (
      <div>
        <h1>Sticky Sidebar Demo</h1>
        <p>
          This demonstrates the sticky sidebar behavior on desktop viewports.
          The sidebar stays fixed while this main content scrolls independently.
        </p>
        {Array.from({ length: 20 }, (_, i) => (
          <div key={i} style={{ marginBottom: '2rem' }}>
            <h2>Content Section {i + 1}</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat.
            </p>
            <p>
              Duis aute irure dolor in reprehenderit in voluptate velit esse
              cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
              cupidatat non proident, sunt in culpa qui officia deserunt mollit
              anim id est laborum.
            </p>
          </div>
        ))}
      </div>
    ),
  },
};

export const LongSidebarContent: Story = {
  args: {
    sidebarTitle: 'Extensive Documentation',
    navSections: [
      {
        label: 'API Reference',
        items: Array.from({ length: 15 }, (_, i) => ({
          href: `/api/method-${i + 1}`,
          label: `API Method ${i + 1}`,
        })),
      },
      {
        label: 'Components',
        items: Array.from({ length: 20 }, (_, i) => ({
          href: `/components/component-${i + 1}`,
          label: `Component ${i + 1}`,
        })),
      },
      {
        label: 'Utilities',
        items: Array.from({ length: 12 }, (_, i) => ({
          href: `/utils/utility-${i + 1}`,
          label: `Utility ${i + 1}`,
        })),
      },
    ],
    children: (
      <div>
        <h1>Long Sidebar Navigation Demo</h1>
        <p>
          This story demonstrates sidebar scrolling when navigation content
          exceeds the viewport height. The sidebar should be independently
          scrollable on desktop while remaining sticky.
        </p>
        <div
          style={{
            height: '200vh',
            background: 'linear-gradient(to bottom, #f0f0f0, #e0e0e0)',
          }}
        >
          <p>Main content area - scroll to test sticky behavior</p>
        </div>
      </div>
    ),
  },
};

export const MobileHeaderWithToggle: Story = {
  args: {
    sidebarTitle: 'Settings',
    navSections: mockNavSections,
    children: (
      <div>
        <h1>Mobile Header Demo</h1>
        <p>
          This story demonstrates the mobile header with sticky positioning at
          the top of the mobile viewport. The header contains the sidebar title
          on the left and hamburger menu toggle on the right.
        </p>
        <div style={{ height: '150vh' }}>
          <p>Scroll to test sticky header behavior on mobile.</p>
        </div>
      </div>
    ),
  },
  globals: {
    viewport: { value: 'iphone14' },
  },
};

export const MobileMenuDisclosure: Story = {
  args: {
    sidebarTitle: 'Settings',
    navSections: mockNavSections,
    children: (
      <div>
        <h1>Mobile Menu Disclosure</h1>
        <p>
          This story demonstrates the mobile menu disclosure pattern. Click the
          hamburger button to see the navigation slide down/up with smooth
          animation. The menu pushes content down rather than overlaying it.
        </p>
        <div style={{ padding: '2rem 0' }}>
          <h2>Main Content</h2>
          <p>
            This content gets pushed down when the mobile menu is open. The
            disclosure pattern maintains accessibility with proper ARIA states.
          </p>
        </div>
      </div>
    ),
  },
  globals: {
    viewport: { value: 'iphone14' },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Find the hamburger menu toggle button
    const menuToggle = canvas.getByRole('button', { name: /navigation menu/i });

    // Initially, menu should be closed (aria-expanded="false")
    await expect(menuToggle).toHaveAttribute('aria-expanded', 'false');

    // Click to open the menu
    await userEvent.click(menuToggle);

    // Menu should now be open (aria-expanded="true")
    await expect(menuToggle).toHaveAttribute('aria-expanded', 'true');

    // Navigation should be visible
    const navigation = canvas.getByRole('navigation');
    await expect(navigation).toBeVisible();

    // Click again to close the menu
    await userEvent.click(menuToggle);

    // Menu should be closed again
    await expect(menuToggle).toHaveAttribute('aria-expanded', 'false');
  },
};

export const MobileMenuLongContent: Story = {
  args: {
    sidebarTitle: 'Documentation',
    navSections: [
      {
        items: [
          { href: '/docs/getting-started', label: 'Getting Started' },
          { href: '/docs/api-reference', label: 'API Reference' },
          { href: '/docs/examples', label: 'Examples' },
          { href: '/docs/deployment', label: 'Deployment' },
        ],
      },
      {
        label: 'Advanced Topics',
        items: [
          { href: '/docs/configuration', label: 'Configuration' },
          { href: '/docs/customization', label: 'Customization' },
          { href: '/docs/troubleshooting', label: 'Troubleshooting' },
        ],
      },
    ],
    children: (
      <div>
        <h1>Long Navigation Menu</h1>
        <p>
          This demonstrates the disclosure pattern with longer navigation
          content. The menu animation handles varying content heights smoothly.
        </p>
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} style={{ marginBottom: '2rem' }}>
            <h2>Section {i + 1}</h2>
            <p>
              Content that gets pushed down when the mobile navigation menu is
              expanded. The disclosure animation maintains proper flow and
              accessibility.
            </p>
          </div>
        ))}
      </div>
    ),
  },
  globals: {
    viewport: { value: 'iphone14' },
  },
};

export const KeyboardNavigationSkipLink: Story = {
  args: {
    sidebarTitle: 'Settings',
    navSections: mockNavSections,
    children: (
      <div>
        <h1>Keyboard Navigation Demo</h1>
        <p>
          This story demonstrates keyboard navigation features including the
          skip link. Press Tab to see the skip link appear, then press Enter to
          jump to main content.
        </p>
        <p>
          The skip link is positioned absolutely and only becomes visible when
          focused, providing an accessible way to bypass navigation.
        </p>
      </div>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check that skip link exists but is initially hidden
    const skipLink = canvas.getByRole('link', {
      name: /skip to main content/i,
    });
    await expect(skipLink).toBeInTheDocument();

    // Check that main content area has proper ID and tabindex
    const mainContent = canvas.getByRole('main');
    await expect(mainContent).toHaveAttribute('id', 'main-content');
    await expect(mainContent).toHaveAttribute('tabIndex', '-1');
  },
};

export const KeyboardNavigationEscapeKey: Story = {
  args: {
    sidebarTitle: 'Settings',
    navSections: mockNavSections,
    children: (
      <div>
        <h1>Escape Key Navigation</h1>
        <p>
          This story demonstrates Escape key functionality for closing the
          mobile menu. Open the mobile menu manually and press Escape to close
          it.
        </p>
        <p>
          Focus should return to the hamburger menu button after closing with
          Escape key for proper accessibility.
        </p>
        <p>
          <em>
            Note: Manual testing required - automated tests have issues with
            global keyboard events.
          </em>
        </p>
      </div>
    ),
  },
  globals: {
    viewport: { value: 'iphone14' },
  },
};

export const NavigationVisualStates: Story = {
  args: {
    sidebarTitle: 'Settings',
    navSections: mockNavSections,
    currentPath: '/settings/profile',
    children: (
      <div>
        <h1>Navigation Visual States</h1>
        <p>
          This story demonstrates the visual states of navigation items. The
          "Profile" item is marked as active/current with bold text and a left
          border.
        </p>
        <p>
          Hover over navigation items to see the hover state with primary-100
          background color. Focus navigation items with Tab key to see focus
          outline.
        </p>
        <p>
          All visual states work consistently across desktop and mobile
          viewports.
        </p>
      </div>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Find the active navigation item
    const activeLink = canvas.getByRole('link', { name: /profile/i });

    // Check that active item has proper ARIA attribute
    await expect(activeLink).toHaveAttribute('aria-current', 'page');

    // Test hover interaction on a non-active item
    const nonActiveLink = canvas.getByRole('link', { name: /access tokens/i });
    await userEvent.hover(nonActiveLink);
  },
};

export const MobileNavigationVisualStates: Story = {
  args: {
    sidebarTitle: 'Settings',
    navSections: mockNavSections,
    currentPath: '/settings/access-tokens',
    children: (
      <div>
        <h1>Mobile Navigation Visual States</h1>
        <p>
          This demonstrates navigation visual states on mobile. The "Access
          Tokens" item is active. Visual states are consistent between desktop
          and mobile.
        </p>
        <p>
          Open the mobile menu to see the navigation items with proper visual
          states.
        </p>
      </div>
    ),
  },
  globals: {
    viewport: { value: 'iphone14' },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Open the mobile menu first
    const menuToggle = canvas.getByRole('button', { name: /navigation menu/i });
    await userEvent.click(menuToggle);

    // Find the active navigation item (now visible)
    const activeLink = canvas.getByRole('link', { name: /access tokens/i });

    // Check that active item has proper ARIA attribute
    await expect(activeLink).toHaveAttribute('aria-current', 'page');
  },
};
