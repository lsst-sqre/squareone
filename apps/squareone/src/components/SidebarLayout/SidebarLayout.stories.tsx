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
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
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
  parameters: {
    viewport: {
      defaultViewport: 'mobile2',
    },
  },
};
