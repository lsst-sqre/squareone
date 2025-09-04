import type { Meta, StoryObj } from '@storybook/nextjs-vite';
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
