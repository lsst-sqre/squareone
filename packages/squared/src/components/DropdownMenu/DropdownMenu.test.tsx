import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import DropdownMenu from './DropdownMenu';

describe('DropdownMenu', () => {
  describe('Basic rendering', () => {
    it('renders the trigger', () => {
      render(
        <DropdownMenu>
          <DropdownMenu.Trigger>Actions</DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item>Mark read</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
      );

      const trigger = screen.getByRole('button', { name: 'Actions' });
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('does not render the menu until opened', () => {
      render(
        <DropdownMenu>
          <DropdownMenu.Trigger>Actions</DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item>Mark read</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
      );

      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  describe('Opening and selecting', () => {
    it('opens the menu when the trigger is clicked', async () => {
      const user = userEvent.setup();

      render(
        <DropdownMenu>
          <DropdownMenu.Trigger>Actions</DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item>Mark read</DropdownMenu.Item>
            <DropdownMenu.Item>Mark all read</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
      );

      const trigger = screen.getByRole('button', { name: 'Actions' });
      await user.click(trigger);

      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByRole('menu')).toBeInTheDocument();
      expect(
        screen.getByRole('menuitem', { name: 'Mark read' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('menuitem', { name: 'Mark all read' })
      ).toBeInTheDocument();
    });

    it('fires the item handler and closes the menu on click', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();

      render(
        <DropdownMenu>
          <DropdownMenu.Trigger>Actions</DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item onSelect={onSelect}>Mark read</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
      );

      const trigger = screen.getByRole('button', { name: 'Actions' });
      await user.click(trigger);

      const item = screen.getByRole('menuitem', { name: 'Mark read' });
      await user.click(item);

      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('Keyboard interaction', () => {
    it('opens with the Enter key', async () => {
      const user = userEvent.setup();

      render(
        <DropdownMenu>
          <DropdownMenu.Trigger>Actions</DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item>Mark read</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
      );

      const trigger = screen.getByRole('button', { name: 'Actions' });
      trigger.focus();
      await user.keyboard('{Enter}');

      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('selects a focused item with the Enter key', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();

      render(
        <DropdownMenu>
          <DropdownMenu.Trigger>Actions</DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item onSelect={onSelect}>Mark read</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
      );

      const trigger = screen.getByRole('button', { name: 'Actions' });
      await user.click(trigger);

      // Focus the first item, then activate it.
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');

      expect(onSelect).toHaveBeenCalledTimes(1);
    });

    it('closes with the Escape key', async () => {
      const user = userEvent.setup();

      render(
        <DropdownMenu>
          <DropdownMenu.Trigger>Actions</DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item>Mark read</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
      );

      const trigger = screen.getByRole('button', { name: 'Actions' });
      await user.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');

      await user.keyboard('{Escape}');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('Label and separator', () => {
    it('renders a label and a separator', async () => {
      const user = userEvent.setup();

      render(
        <DropdownMenu>
          <DropdownMenu.Trigger>Actions</DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Label>Bulk actions</DropdownMenu.Label>
            <DropdownMenu.Separator />
            <DropdownMenu.Item>Mark read</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
      );

      await user.click(screen.getByRole('button', { name: 'Actions' }));

      expect(screen.getByText('Bulk actions')).toBeInTheDocument();
      expect(screen.getByRole('separator')).toBeInTheDocument();
    });
  });

  describe('Disabled items', () => {
    it('does not fire the handler for a disabled item', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();

      render(
        <DropdownMenu>
          <DropdownMenu.Trigger>Actions</DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item disabled onSelect={onSelect}>
              Mark read
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
      );

      await user.click(screen.getByRole('button', { name: 'Actions' }));

      const item = screen.getByRole('menuitem', { name: 'Mark read' });
      expect(item).toHaveAttribute('data-disabled');

      await user.click(item);
      expect(onSelect).not.toHaveBeenCalled();
    });
  });

  describe('Composition', () => {
    it('forwards the trigger ref', () => {
      const ref = vi.fn();

      render(
        <DropdownMenu>
          <DropdownMenu.Trigger ref={ref}>Actions</DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item>Mark read</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
      );

      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLButtonElement);
    });

    it('renders a custom trigger element with asChild', () => {
      render(
        <DropdownMenu>
          <DropdownMenu.Trigger asChild>
            <button type="button" data-testid="custom-trigger">
              Custom
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item>Mark read</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
      );

      const trigger = screen.getByTestId('custom-trigger');
      expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    });

    it('applies a custom className to an item', async () => {
      const user = userEvent.setup();

      render(
        <DropdownMenu>
          <DropdownMenu.Trigger>Actions</DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item className="custom-item">
              Mark read
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
      );

      await user.click(screen.getByRole('button', { name: 'Actions' }));
      expect(screen.getByRole('menuitem', { name: 'Mark read' })).toHaveClass(
        'custom-item'
      );
    });
  });
});
