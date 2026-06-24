import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../Button';
import { DropdownMenu } from './DropdownMenu';

const meta: Meta<typeof DropdownMenu> = {
  title: 'Components/DropdownMenu',
  component: DropdownMenu,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic bulk-actions menu
export const Default: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenu.Trigger>Actions</DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item>Mark read</DropdownMenu.Item>
        <DropdownMenu.Item>Mark all read</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Actions' });

    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    // Menu content is portaled, so search the whole document.
    await waitFor(() => {
      expect(
        within(document.body).getByRole('menuitem', { name: 'Mark read' })
      ).toBeInTheDocument();
    });
    expect(
      within(document.body).getByRole('menuitem', { name: 'Mark all read' })
    ).toBeInTheDocument();
  },
};

// Bulk-actions menu with a label and separator, like a selection toolbar
export const WithLabelAndSeparator: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenu.Trigger>Bulk actions</DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Label>2 selected</DropdownMenu.Label>
        <DropdownMenu.Separator />
        <DropdownMenu.Item>Mark read</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Bulk actions' }));

    await waitFor(() => {
      expect(within(document.body).getByText('2 selected')).toBeInTheDocument();
    });
    expect(within(document.body).getByRole('separator')).toBeInTheDocument();
  },
};

// Selecting an item fires its handler
export const ItemSelection: Story = {
  render: () => {
    const [lastAction, setLastAction] = useState<string>('none');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <DropdownMenu>
          <DropdownMenu.Trigger>Actions</DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item onSelect={() => setLastAction('Marked read')}>
              Mark read
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onSelect={() => setLastAction('Marked all read')}
            >
              Mark all read
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
        <div>Last action: {lastAction}</div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Actions' });

    expect(canvas.getByText('Last action: none')).toBeInTheDocument();

    await userEvent.click(trigger);
    const item = await waitFor(() =>
      within(document.body).getByRole('menuitem', { name: 'Mark read' })
    );
    await userEvent.click(item);

    await waitFor(() => {
      expect(canvas.getByText('Last action: Marked read')).toBeInTheDocument();
    });
    // The menu closes after a selection.
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
};

// Keyboard interaction: open and select with the keyboard
export const KeyboardInteraction: Story = {
  render: () => {
    const [lastAction, setLastAction] = useState<string>('none');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <DropdownMenu>
          <DropdownMenu.Trigger>Actions</DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item onSelect={() => setLastAction('Marked read')}>
              Mark read
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
        <div>Last action: {lastAction}</div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Actions' });

    trigger.focus();
    await userEvent.keyboard('{Enter}');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{Enter}');

    await waitFor(() => {
      expect(canvas.getByText('Last action: Marked read')).toBeInTheDocument();
    });
  },
};

// Disabled item is not selectable
export const DisabledItem: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenu.Trigger>Actions</DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item>Mark read</DropdownMenu.Item>
        <DropdownMenu.Item disabled>Delete (coming soon)</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Actions' }));

    const disabledItem = await waitFor(() =>
      within(document.body).getByRole('menuitem', {
        name: 'Delete (coming soon)',
      })
    );
    expect(disabledItem).toHaveAttribute('data-disabled');
  },
};

// Custom trigger via asChild, composing the squared Button
export const CustomTrigger: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button size="sm">Actions</Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item>Mark read</DropdownMenu.Item>
        <DropdownMenu.Item>Mark all read</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Actions' });

    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');

    await userEvent.click(trigger);
    await waitFor(() => {
      expect(
        within(document.body).getByRole('menuitem', { name: 'Mark read' })
      ).toBeInTheDocument();
    });
  },
};
