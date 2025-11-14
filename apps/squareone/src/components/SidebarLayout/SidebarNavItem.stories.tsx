import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';
import SidebarNavItem from './SidebarNavItem';

const meta: Meta<typeof SidebarNavItem> = {
  title: 'Components/SidebarLayout/SidebarNavItem',
  component: SidebarNavItem,
  argTypes: {
    onNavigate: { action: 'navigate' },
  },
};

export default meta;
type Story = StoryObj<typeof SidebarNavItem>;

const mockItem = {
  href: '/settings/profile',
  label: 'Profile Settings',
};

export const Default: Story = {
  args: {
    item: mockItem,
    isActive: false,
    onNavigate: () => {},
  },
};

export const Active: Story = {
  args: {
    item: mockItem,
    isActive: true,
    onNavigate: () => {},
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check that the active item has proper ARIA attribute
    const link = canvas.getByRole('link', { name: /profile settings/i });
    await expect(link).toHaveAttribute('aria-current', 'page');
  },
};

export const HoverState: Story = {
  args: {
    item: mockItem,
    isActive: false,
    onNavigate: () => {},
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const link = canvas.getByRole('link', { name: /profile settings/i });

    // Test hover state - just verify hover interaction works
    await userEvent.hover(link);

    // Verify link is still accessible after hover
    await expect(link).toBeInTheDocument();
  },
};

export const FocusState: Story = {
  args: {
    item: mockItem,
    isActive: false,
    onNavigate: () => {},
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const link = canvas.getByRole('link', { name: /profile settings/i });

    // Focus on the link using Tab key
    await userEvent.tab();

    // Verify that the link receives focus
    await expect(link).toHaveFocus();
  },
};

export const ClickInteraction: Story = {
  args: {
    item: mockItem,
    isActive: false,
    onNavigate: (e) => {
      if (e) {
        e.preventDefault();
      }
      console.log('Navigation prevented for Storybook test');
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const link = canvas.getByRole('link', { name: /profile settings/i });

    // Verify link has correct href
    await expect(link).toHaveAttribute('href', '/settings/profile');

    // Click interaction is handled by onNavigate prop
    await userEvent.click(link);
  },
};

export const LongLabelText: Story = {
  args: {
    item: {
      href: '/settings/security-and-privacy',
      label: 'Security and Privacy Settings Configuration',
    },
    isActive: false,
    onNavigate: () => {},
  },
};

export const ActiveWithLongLabel: Story = {
  args: {
    item: {
      href: '/settings/security-and-privacy',
      label: 'Security and Privacy Settings Configuration',
    },
    isActive: true,
    onNavigate: () => {},
  },
};
