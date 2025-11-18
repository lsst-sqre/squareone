import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChevronDown } from 'react-feather';
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
