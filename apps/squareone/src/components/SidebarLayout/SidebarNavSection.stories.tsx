import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { userEvent, within, expect } from 'storybook/test';
import SidebarNavSection from './SidebarNavSection';

const meta: Meta<typeof SidebarNavSection> = {
  title: 'Components/SidebarLayout/SidebarNavSection',
  component: SidebarNavSection,
  argTypes: {
    onNavigate: { action: 'navigate' },
  },
};

export default meta;
type Story = StoryObj<typeof SidebarNavSection>;

const mockSectionWithLabel = {
  label: 'Security',
  items: [
    { href: '/settings/sessions', label: 'Sessions' },
    { href: '/settings/access-tokens', label: 'Access Tokens' },
    { href: '/settings/two-factor', label: 'Two-Factor Authentication' },
  ],
};

const mockSectionWithoutLabel = {
  items: [
    { href: '/settings/profile', label: 'Profile' },
    { href: '/settings/account', label: 'Account Settings' },
    { href: '/settings/notifications', label: 'Notifications' },
  ],
};

export const WithLabel: Story = {
  args: {
    section: mockSectionWithLabel,
    sectionIndex: 0,
    currentPath: '/settings/sessions',
    onNavigate: () => {},
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check that section label is present
    const sectionLabel = canvas.getByTestId('section-label');
    await expect(sectionLabel).toBeInTheDocument();
    await expect(sectionLabel).toHaveTextContent('Security');

    // Verify label is properly styled (visual states tested in browser)
    await expect(sectionLabel).toBeVisible();

    // Check that navigation items are rendered
    const navItems = canvas.getAllByTestId('sidebar-nav-item');
    await expect(navItems).toHaveLength(3);

    // Check active item
    const activeItem = canvas.getByRole('link', { name: /sessions/i });
    await expect(activeItem).toHaveAttribute('aria-current', 'page');
  },
};

export const WithoutLabel: Story = {
  args: {
    section: mockSectionWithoutLabel,
    sectionIndex: 0,
    currentPath: '/settings/profile',
    onNavigate: () => {},
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check that section label is NOT present
    const sectionLabel = canvas.queryByTestId('section-label');
    await expect(sectionLabel).not.toBeInTheDocument();

    // Check that navigation items are still rendered
    const navItems = canvas.getAllByTestId('sidebar-nav-item');
    await expect(navItems).toHaveLength(3);

    // Check active item
    const activeItem = canvas.getByRole('link', { name: /profile/i });
    await expect(activeItem).toHaveAttribute('aria-current', 'page');
  },
};

export const NoActiveItems: Story = {
  args: {
    section: mockSectionWithLabel,
    sectionIndex: 0,
    currentPath: '/different-path',
    onNavigate: () => {},
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check that no items have aria-current="page"
    const navItems = canvas.getAllByTestId('sidebar-nav-item');

    for (const item of navItems) {
      await expect(item).not.toHaveAttribute('aria-current', 'page');
    }
  },
};

export const SingleItem: Story = {
  args: {
    section: {
      label: 'Single Item Section',
      items: [{ href: '/single-item', label: 'Single Item' }],
    },
    sectionIndex: 0,
    currentPath: '/single-item',
    onNavigate: () => {},
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check section has label
    const sectionLabel = canvas.getByTestId('section-label');
    await expect(sectionLabel).toHaveTextContent('Single Item Section');

    // Check only one navigation item
    const navItems = canvas.getAllByTestId('sidebar-nav-item');
    await expect(navItems).toHaveLength(1);

    // Check the single item is active
    const singleItem = canvas.getByRole('link', { name: /single item/i });
    await expect(singleItem).toHaveAttribute('aria-current', 'page');
  },
};

export const InteractionTest: Story = {
  args: {
    section: mockSectionWithLabel,
    sectionIndex: 0,
    currentPath: '',
    onNavigate: (e) => {
      if (e) {
        e.preventDefault();
      }
      console.log('Navigation prevented for Storybook test');
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test hover interactions on navigation items
    const navItems = canvas.getAllByTestId('sidebar-nav-item');

    // Hover over first item
    await userEvent.hover(navItems[0]);
    await expect(navItems[0]).toBeInTheDocument();

    // Click interaction
    await userEvent.click(navItems[1]);

    // Focus navigation with Tab key
    await userEvent.tab();
  },
};
