import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../Button';
import { DropdownMenu } from './DropdownMenu';

const meta: Meta<typeof DropdownMenu> = {
  title: 'Components/DropdownMenu',
  component: DropdownMenu,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '`DropdownMenu` presents a list of actions in a popover anchored to ' +
          'a trigger button. Reach for it for action menus — bulk actions on ' +
          'a selection, per-row "…" overflow menus, or any compact set of ' +
          'commands that would otherwise crowd a toolbar. It is built on ' +
          'Radix UI primitives, so keyboard navigation, focus management, ' +
          'typeahead, and ARIA menu roles work out of the box.\n\n' +
          'It is **not** a form control: items fire actions via `onSelect` ' +
          'rather than binding a value. When the user needs to pick a value ' +
          'from a list, use `Select` instead.\n\n' +
          '**Anatomy** — compose these subcomponents:\n\n' +
          '- `DropdownMenu` (root) — owns the open state. Uncontrolled by ' +
          'default; pass `open` + `onOpenChange` to control it, or ' +
          '`defaultOpen` to set the initial state. `modal` (default `true`) ' +
          'traps focus and blocks outside interaction while the menu is ' +
          'open.\n' +
          '- `DropdownMenu.Trigger` — the button that opens the menu. ' +
          'Renders a styled button with a chevron affordance by default; set ' +
          '`showChevron={false}` to hide it, or `asChild` to use your own ' +
          'element (for example a squared `Button`) as the trigger.\n' +
          '- `DropdownMenu.Content` — the popover, rendered in a portal so it ' +
          'escapes overflow clipping. Tune placement with `align` (`start` ' +
          'by default) and `sideOffset` (`6` by default).\n' +
          '- `DropdownMenu.Item` — a selectable action. Use `onSelect` for ' +
          'its handler and `disabled` to make it inert.\n' +
          '- `DropdownMenu.Label` and `DropdownMenu.Separator` — ' +
          'non-interactive helpers for titling and visually grouping items.' +
          '\n\nThe stories below demonstrate the common variants.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// The default trigger renders a styled button with a chevron affordance and
// opens a simple list of actions.
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

// `DropdownMenu.Label` and `DropdownMenu.Separator` add a non-interactive
// heading and a divider — useful for captioning a selection toolbar.
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

// Each `DropdownMenu.Item` fires its `onSelect` handler when chosen, and the
// menu closes automatically afterward.
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

// A `disabled` item is skipped by pointer and keyboard navigation and cannot
// be selected.
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

// `asChild` lets you supply your own trigger element — here a squared
// `Button` — instead of the default styled button. The chevron is omitted so
// the trigger's own styling is preserved.
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
