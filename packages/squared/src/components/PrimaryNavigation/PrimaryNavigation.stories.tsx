import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChevronDown } from 'lucide-react';
import type React from 'react';
import { expect, screen, userEvent, within } from 'storybook/test';

import { PrimaryNavigation } from './PrimaryNavigation';

const meta: Meta<typeof PrimaryNavigation> = {
  title: 'Components/PrimaryNavigation',
  component: PrimaryNavigation,
  parameters: {
    layout: 'centered',
  },
  globals: {
    backgrounds: { value: 'dark' },
  },
};

export default meta;
type Story = StoryObj<typeof PrimaryNavigation>;

export const Default: Story = {
  args: {},
  render: (args) => (
    <PrimaryNavigation {...args}>
      <PrimaryNavigation.Item>
        <PrimaryNavigation.TriggerLink href="#">
          Portal
        </PrimaryNavigation.TriggerLink>
      </PrimaryNavigation.Item>

      <PrimaryNavigation.Item>
        <PrimaryNavigation.TriggerLink href="/nb">
          Notebooks
        </PrimaryNavigation.TriggerLink>
        <PrimaryNavigation.Content>
          <PrimaryNavigation.ContentItem>
            <PrimaryNavigation.Link href="#">Settings</PrimaryNavigation.Link>
          </PrimaryNavigation.ContentItem>
          <PrimaryNavigation.ContentItem>
            <PrimaryNavigation.Link href="#">Logout</PrimaryNavigation.Link>
          </PrimaryNavigation.ContentItem>
        </PrimaryNavigation.Content>
      </PrimaryNavigation.Item>

      <PrimaryNavigation.Item>
        <PrimaryNavigation.TriggerLink href="/docs">
          Documentation
        </PrimaryNavigation.TriggerLink>
      </PrimaryNavigation.Item>

      <PrimaryNavigation.Item>
        <PrimaryNavigation.Trigger>
          Account <ChevronDown />
        </PrimaryNavigation.Trigger>
        <PrimaryNavigation.Content>
          <PrimaryNavigation.ContentItem>
            <PrimaryNavigation.Link href="#">Settings</PrimaryNavigation.Link>
          </PrimaryNavigation.ContentItem>
          <PrimaryNavigation.ContentItem>
            <PrimaryNavigation.Link href="#">Logout</PrimaryNavigation.Link>
          </PrimaryNavigation.ContentItem>
        </PrimaryNavigation.Content>
      </PrimaryNavigation.Item>
    </PrimaryNavigation>
  ),
};

export const OpenedMenu: Story = {
  args: {},
  tags: ['test'],

  play: async ({ canvasElement }) => {
    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
    const canvas = within(canvasElement);

    const accountTrigger = canvas.getByText('Account');

    await userEvent.click(accountTrigger);

    // Delay so menu can open
    await delay(250);
    await expect(screen.getByText('Settings')).toBeInTheDocument();
  },

  render: (args) => (
    <PrimaryNavigation {...args}>
      <PrimaryNavigation.Item>
        <PrimaryNavigation.TriggerLink href="#">
          Portal
        </PrimaryNavigation.TriggerLink>
      </PrimaryNavigation.Item>

      <PrimaryNavigation.Item>
        <PrimaryNavigation.TriggerLink href="/nb">
          Notebooks
        </PrimaryNavigation.TriggerLink>
      </PrimaryNavigation.Item>

      <PrimaryNavigation.Item>
        <PrimaryNavigation.TriggerLink href="/docs">
          Documentation
        </PrimaryNavigation.TriggerLink>
      </PrimaryNavigation.Item>

      <PrimaryNavigation.Item>
        <PrimaryNavigation.Trigger>
          Account <ChevronDown />
        </PrimaryNavigation.Trigger>
        <PrimaryNavigation.Content>
          <PrimaryNavigation.ContentItem>
            <PrimaryNavigation.Link href="#">Settings</PrimaryNavigation.Link>
          </PrimaryNavigation.ContentItem>
          <PrimaryNavigation.ContentItem>
            <PrimaryNavigation.Link href="#">Logout</PrimaryNavigation.Link>
          </PrimaryNavigation.ContentItem>
        </PrimaryNavigation.Content>
      </PrimaryNavigation.Item>
    </PrimaryNavigation>
  ),
};

const collapsibleNav = (
  args: React.ComponentProps<typeof PrimaryNavigation>
) => (
  <PrimaryNavigation {...args}>
    <PrimaryNavigation.Item>
      <PrimaryNavigation.TriggerLink href="#">
        Portal
      </PrimaryNavigation.TriggerLink>
    </PrimaryNavigation.Item>

    <PrimaryNavigation.Item>
      <PrimaryNavigation.TriggerLink href="/nb">
        Notebooks
      </PrimaryNavigation.TriggerLink>
    </PrimaryNavigation.Item>

    <PrimaryNavigation.Item>
      <PrimaryNavigation.TriggerLink href="/docs">
        Documentation
      </PrimaryNavigation.TriggerLink>
    </PrimaryNavigation.Item>

    <PrimaryNavigation.Item>
      <PrimaryNavigation.TriggerLink href="/support">
        Support
      </PrimaryNavigation.TriggerLink>
    </PrimaryNavigation.Item>
  </PrimaryNavigation>
);

/**
 * At narrow viewports the navigation collapses behind an accessible hamburger
 * toggle. This story renders inside a 320px viewport so the collapsed treatment
 * is visible; use the toggle to disclose the menu.
 */
export const Collapsed: Story = {
  args: {},
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  render: (args) => collapsibleNav(args),
};

/**
 * Exercises the collapsed menu's toggle: opening the disclosure reveals the
 * navigation items and flips the toggle's accessible name / `aria-expanded`.
 */
export const CollapsedOpened: Story = {
  args: {},
  tags: ['test'],
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const toggle = canvas.getByRole('button', {
      name: 'Open navigation menu',
    });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(toggle);

    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(toggle).toHaveAccessibleName('Close navigation menu');
    await expect(canvas.getByText('Portal')).toBeVisible();
  },

  render: (args) => collapsibleNav(args),
};
