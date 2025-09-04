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
