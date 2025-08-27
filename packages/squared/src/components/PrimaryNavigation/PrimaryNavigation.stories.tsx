import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, userEvent, screen, expect } from '@storybook/test';

import { ChevronDown } from 'react-feather';

import { PrimaryNavigation } from './PrimaryNavigation';

const meta: Meta<typeof PrimaryNavigation> = {
  title: 'Components/PrimaryNavigation',
  component: PrimaryNavigation,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#1f2121' }],
    },
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
        <PrimaryNavigation.Trigger href="/nb">
          Notebooks <ChevronDown />
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
